import { useCallback, useEffect, useRef, useState, useTransition, type Dispatch, type SetStateAction } from "react";
import { href } from "react-router";
import { toast } from "react-toastify";
import { useEventSource } from "remix-utils/sse/react";
import type { ChatMessage } from "~/utils/chat.server";

// Custom hook for SSE subscription, visibility, and participants
export function useChatSubscription(roomId: string, initialMessages: ChatMessage[], setIsActiveRoom: Dispatch<SetStateAction<boolean>>) {
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
    const hasExpiredRef = useRef(false);
    const path = `${href("/chat/stream")}?roomId=${roomId}`;

    const newMessage = useEventSource(path, { event: "new-message" });
    const heartbeat = useEventSource(path, { event: "heartbeat" });
    const participants = useEventSource(path, { event: "participants" });
    const chatExpired = useEventSource(path, { event: "chat_expired" });

    const fetchMissedMessages = useCallback(() => async () => {
        console.info("fetching missed msgs")
        try {
            setIsFetching(true)
            const response = await fetch(`/api/chat/missed?roomId=${roomId}&since=${lastTimestampRef.current}`);
            const missedMessages: ChatMessage[] = await response.json();

            if (missedMessages.length > 0) {
                console.info("there are missed msgs")
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
            }
        } catch (error) {
            console.error("Failed to fetch missed messages:", error);
        } finally {
            setIsFetching(false)
        }
    }, [])


    useEffect(() => {
        // Handle chatExpired event
        if (chatExpired && !hasExpiredRef.current) {
            console.log(JSON.parse(chatExpired))
            toast.info("Esta sesión ha finalizado. Gracias por participar!")
            setIsActiveRoom(false);
            hasExpiredRef.current = true; // Mark as handled
            return;
            // Handle new messages
        } else if (newMessage) {
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

            // Handle participant count
        } else if (participants) {
            try {
                const event = JSON.parse(participants);
                setParticipantCount(parseInt(event.count)); // Sync with server count
                console.log(`Participant count updated to ${event.count}`);
            } catch (error) {
                console.error("Error processing participants:", error);
            }
        }

    }, [newMessage, participants, chatExpired]);

    // Heartbeat: Detect disconnection
    useEffect(() => {
        if (chatExpired) {
            if (heartbeatTimeoutRef.current) {
                clearTimeout(heartbeatTimeoutRef.current);
                heartbeatTimeoutRef.current = null; // reset ref
            }
            return;
        }

        if (!heartbeat) return;

        lastHeartbeatRef.current = Date.now(); // Update last heartbeat time
        if (heartbeatTimeoutRef.current) {
            clearTimeout(heartbeatTimeoutRef.current);
        }
        heartbeatTimeoutRef.current = setTimeout(() => {
            console.log("Heartbeat timeout - possible disconnect!");
            fetchMissedMessages(); // Fetch if disconnected
        }, 10000); // 10s > 5s heartbeat interval
        return () => {
            if (heartbeatTimeoutRef.current) {
                clearTimeout(heartbeatTimeoutRef.current);
            }
        };
    }, [heartbeat, chatExpired]);

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
        // Only add listener if chat isn’t expired
        if (!chatExpired) {
            document.addEventListener("visibilitychange", handleVisibilityChange);
        }
        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [chatExpired]);

    return {
        liveMessages,
        participantCount,
        isFetching
    };
}