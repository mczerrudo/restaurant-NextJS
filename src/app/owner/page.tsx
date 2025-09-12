
import { getMyRestaurants } from "@/actions/restaurant";

export default async function OwnerDashboard() {
  const data = await getMyRestaurants();


  return (
    <main className="max-w-5xl mx-auto p-6 space-y-3">
      <h1 className="text-xl font-semibold">My Restaurants</h1>
      <ul className="divide-y rounded-lg border">
        {data.map((r:any) => (
          <li key={r.id} className="p-4">{r.name}</li>
        ))}
      </ul>
    </main>
  );
}
