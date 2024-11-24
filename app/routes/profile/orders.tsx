import type { Route } from "./+types/orders";

export async function loader({ request }: Route.LoaderArgs) {

}

export default function Orders() {
    return (
        <div>Orders</div>
    )
}
