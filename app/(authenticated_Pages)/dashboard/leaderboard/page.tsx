"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";

interface LeaderboardUser {
  id: string; username: string; points: number;
}

const maskUsername = (username: string) => {
  // A simple regex to check for something that looks like an email.
  const emailRegex = /\S+@\S+\.\S+/;
  if (emailRegex.test(username)) {
    const parts = username.split('@');
    if (parts.length === 2) {
      const localPart = parts[0];
      const domain = parts[1];
      if (localPart.length > 0) {
        const maskedLocalPart = localPart[0] + '***';
        return `${maskedLocalPart}@${domain}`;
      }
    }
  }
  return username;
};

const LeaderboardPage = () => {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  useEffect(() => {
    axios.get("/api/leaderboard").then(res => setUsers(res.data));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Leaderboard</h1>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Rank</TableHead>
              <TableHead>User</TableHead>
              <TableHead className="text-right">Points</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user, index) => (
              <TableRow key={user.id}>
                <TableCell className="font-bold text-lg">{index + 1}</TableCell>
                <TableCell>{maskUsername(user.username)}</TableCell>
                <TableCell className="text-right font-semibold">{user.points} XP</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};
export default LeaderboardPage;
