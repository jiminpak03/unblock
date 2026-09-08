import { useState } from "react";
import type { Member } from "../types/board";

interface BoardMembersProps {
  members: Member[];
  currentUserId: number;
  isOwner: boolean;
  onRemoveMember: (userId: number) => void;
  onInviteMember: (username: string, role: string) => Promise<boolean>;
}

function BoardMembers({
  members,
  currentUserId,
  isOwner,
  onRemoveMember,
  onInviteMember,
}: BoardMembersProps) {
  const [usernameToInvite, setUsernameToInvite] = useState("");
  const [targetRole, setTargetRole] = useState<string | null>(null);

  async function handleInviteMember(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!usernameToInvite || !targetRole) return;

    const ok = await onInviteMember(usernameToInvite, targetRole);
    if (ok) {
      setUsernameToInvite("");
      setTargetRole(null);
    }
  }

  return (
    <div className="mb-6">
      <h2 className="font-semibold text-sm mb-2">Members</h2>
      <ul className="text-sm space-y-1 mb-4">
        {members.map((m) => (
          <li
            key={m.userId}
            className="flex justify-between max-w-xs items-center"
          >
            <span>{m.username}</span>
            <span className="flex items-center gap-2">
              <span className="text-gray-500">{m.role}</span>
              {isOwner && m.userId !== currentUserId && (
                <button
                  onClick={() => onRemoveMember(m.userId)}
                  className="text-xs text-red-500"
                >
                  Remove
                </button>
              )}
            </span>
          </li>
        ))}
      </ul>

      {isOwner && (
        <form onSubmit={handleInviteMember} className="flex gap-2">
          <input
            value={usernameToInvite}
            onChange={(e) => setUsernameToInvite(e.target.value)}
            placeholder="Username to invite"
            className="border rounded-lg px-3 py-2 flex-1"
          />
          <select
            value={targetRole ?? ""}
            onChange={(e) => setTargetRole(e.target.value)}
            className="border rounded-lg px-2"
          >
            <option value="" disabled>
              Choose a role
            </option>
            <option value="VIEWER">Viewer</option>
            <option value="EDITOR">Editor</option>
            <option value="OWNER">Owner</option>
          </select>
          <button
            type="submit"
            className="bg-indigo-600 text-white rounded-lg px-4 py-2"
          >
            Invite
          </button>
        </form>
      )}
    </div>
  );
}

export default BoardMembers;
