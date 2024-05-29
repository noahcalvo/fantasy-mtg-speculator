import { Card } from "@/app/ui/dashboard/cards";
import {Card as CardType} from "@/app/lib/definitions";
import { useEffect, useState } from "react";
import { fetchPlayerCollection } from "@/app/lib/collection";

export default async function TotalCardsBadge({email}: {email: string}){
    const collection = await fetchPlayerCollection(email);
    return (
        <Card title="Total Cards In Your Collection" value={collection.rows.length} type="collected"/>
     );
}