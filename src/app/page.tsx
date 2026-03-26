import { redirect } from "next/navigation";

export default function Home() {
    // Redirige instantanément tout visiteur vers notre Route Group (auth)
    redirect("/login");
}