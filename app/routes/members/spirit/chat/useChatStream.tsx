import { useEffect, useRef, useState, useTransition } from "react";
import { useEventSource } from "remix-utils/sse/react";
import type { ChatMessage } from "~/utils/chat.server";

// Custom hook for SSE subscription, visibility, and participants
export function useChatSubscription(roomId: string, initialMessages: ChatMessage[], userId: string) {
    const [liveMessages, setLiveMessages] = useState<ChatMessage[]>([]);
    const [participantCount, setParticipantCount] = useState<number>(1);
    const [isFetching, setIsFetching] = useState(false)
    const [, startTransition] = useTransition();

    const lastTimestampRef = useRef<string>(
        initialMessages.length > 0
            ? new Date(initialMessages[initialMessages.length - 1].createdAt).toISOString()
            : new Date(0).toISOString()
    );

    const heartbeatTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastHeartbeatRef = useRef<number>(0); // Tracks last heartbeat for disconnection and visibility checks

    const path = `/chat/subscribe?roomId=${roomId}&userId=${encodeURIComponent(userId)}`;

    const newMessage = useEventSource(path, { event: "new-message" });
    const heartbeat = useEventSource(path, { event: "heartbeat" });
    const participants = useEventSource(path, { event: "participants" });

    const fetchMissedMessages = async () => {
        console.log("fetching missed msgs")
        try {
            setIsFetching(true)
            const response = await fetch(`/api/chat/missed?roomId=${roomId}&since=${lastTimestampRef.current}`);
            const missedMessages: ChatMessage[] = await response.json();

            if (missedMessages.length > 0) {
                console.log("there are missed msgs")
                startTransition(() => {
                    setLiveMessages((prev) => {
                        const newMessages = missedMessages.filter(
                            (msg) => !prev.some((m) => m.id === msg.id) &&
                                !initialMessages.some((m) => m.id === msg.id)
                        );

                        const updated = [...prev, ...newMessages];
                        if (updated.length > 0) {
                            lastTimestampRef.current = new Date(
                                updated[updated.length - 1].createdAt
                            ).toISOString();
                        }

                        return updated;
                    });
                });
            } else {
                console.log("there are no missed msgs")
            }
        } catch (error) {
            console.error("Failed to fetch missed messages:", error);
        } finally {
            setIsFetching(false)
        }
    };

    // Handle new messages
    useEffect(() => {
        if (!newMessage) return;

        try {
            const message = JSON.parse(newMessage) as ChatMessage;
            console.log("new message", message);

            setLiveMessages((prev) => {
                if (!prev.some((m) => m.id === message.id) &&
                    !initialMessages.some((m) => m.id === message.id)) {
                    lastTimestampRef.current = new Date(message.createdAt).toISOString();
                    return [...prev, message];
                }
                return prev;
            });
        } catch (error) {
            console.error("Error processing message:", error);
        }
    }, [newMessage]);

    // Handle participant count
    useEffect(() => {
        if (!participants) return;
        try {
            const data = JSON.parse(participants);
            console.log("participants", data)
            setParticipantCount(parseInt(data.count, 10));

        } catch (error) {
            console.error("Error processing message:", error);
        }
    }, [participants]);

    // Heartbeat: Detect disconnection
    useEffect(() => {
        if (!heartbeat) return;
        lastHeartbeatRef.current = Date.now(); // Update last heartbeat time
        if (heartbeatTimeoutRef.current) {
            clearTimeout(heartbeatTimeoutRef.current);
        }
        heartbeatTimeoutRef.current = setTimeout(() => {
            console.error("Heartbeat timeout - possible disconnect!");
            fetchMissedMessages(); // Fetch if disconnected
        }, 10000); // 10s > 5s heartbeat interval
        return () => {
            if (heartbeatTimeoutRef.current) {
                clearTimeout(heartbeatTimeoutRef.current);
            }
        };
    }, [heartbeat]);

    // Visibility: Catch up on return
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                const timeSinceLastHeartbeat = Date.now() - lastHeartbeatRef.current;
                if (timeSinceLastHeartbeat > 7000) { // Slightly > heartbeat interval + buffer
                    console.log("Visibility: Fetching due to potential missed heartbeats");
                    fetchMissedMessages();
                } else {
                    console.log("Visibility: No fetch needed, heartbeats recent");
                }
            }
        };
        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, []);

    return {
        liveMessages,
        participantCount,
        isFetching
    };
}