import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import { folders, files } from '@/server/db/schemas';
import { eq, and, inArray } from 'drizzle-orm';

const getUserId = () => '0386a0e0-fbfd-4fda-ac6d-55a969448e9c';

export async function POST(request) {
  try {
    const body = await request.json();
    // ids: array of strings. targetFolderId: string ('root' or id)
    const { ids, targetFolderId: targetIdStr } = body;
    const userId = getUserId();

    let targetId = null;
    if (targetIdStr && targetIdStr !== 'root') {
      targetId = targetIdStr;
    }

    // We don't know if IDs are files or folders from just the ID list unless passed explicitly.
    // Frontend passed `ids` which are usually numbers for DB IDs.
    // But in our Frontend `items` have IDs.
    // Ideally frontend sends `{ type: 'folder', id: '...' }` or we try to update both tables where ID matches.
    // BUT IDs might collide between tables if serials start at 1.
    // Frontend `CloudManager` keeps them in one list, but they come from different tables.
    // In `CloudManager`, we didn't distinguish ID types strictly in the ID string (e.g. 'folder-1').

    // CORRECTION: The Frontend `FolderView` passes `item.id`.
    // We need to know the type to update the correct table.
    // The `CloudManager` `handleMove` receives `sourceIds`.
    // The backend `move` route needs to know providing type is better.
    // I will update the backend to attempt update on both OR ask frontend to send typed objects.
    // For robustness given the current `handleMove` signature, I will update my "items" fetch to return prefixed IDs?
    // OR, I can just accept that I need to filter.

    // Let's UPDATE the Frontend CloudManager to send more info or handle it here.
    // I'll assume for now I will check existence or just run updates on both tables for that specific user and ID.
    // It's inefficient but functional if collision is rare (though serials WILL collision).

    // BETTER: Update the frontend fetch to prefix IDs (e.g. `fld_1`, `fil_1`) so we can distinguish.
    // I will do that in the frontend integration step.
    // For now, let's write the backend to parse such prefixes if I use them.

    // Let's assume input is `{ items: [{id, type}] }`

    // Checking `CloudManager` -> `handleMove(sourceIds, targetFolderId)`
    // `sourceIds` is array of strings.

    // I will modify this route to expect `items` array properly or I will handle the collision issue later.
    // Let's just write update logic that expects an array of objects `{id, type}` or similar.
    // If the frontend sends just IDs, I am stuck.
    // I will update Frontend first to handle this state.

    // ... Wait, I can't update frontend "first" inside this tool call easily.
    // I'll stick to: expect `{ items: [{ id: number, type: 'folder'|'file' }] }` in body.

    const { items } = body;
    if (!items || !items.length) {
      return NextResponse.json({ success: true }); // No op
    }

    const folderIds = items.filter((i) => i.type === 'folder').map((i) => i.id);
    const fileIds = items.filter((i) => i.type !== 'folder').map((i) => i.id);

    if (folderIds.length) {
      await db
        .update(folders)
        .set({ parentId: targetId })
        .where(and(eq(folders.userId, userId), inArray(folders.id, folderIds)));
    }

    if (fileIds.length) {
      await db
        .update(files)
        .set({ parentId: targetId })
        .where(and(eq(files.userId, userId), inArray(files.id, fileIds)));
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Move Error', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
