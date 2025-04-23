import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../firebaseApp";

export const createTodoList = async (title: string, ownerUid: string, initialCollaborators: { email: string, role: "admin" | "viewer" }[] = []) => {
  const docRef = await addDoc(collection(db, "todoLists"), {
    title,
    owner: ownerUid,
    collaborators: initialCollaborators,
  });
  return docRef.id;
};

export const getTodoLists = async (userUid: string, userEmail: string) => {
  const snapshot = await getDocs(collection(db, "todoLists"));
  const allLists = snapshot.docs
    .map((doc) => ({ id: doc.id, ...(doc.data() as { title: string; owner: string; collaborators: { email: string; role: "admin" | "viewer" }[] }) }))
    .filter((list: { id: string; title: string; owner: string; collaborators: { email: string; role: "admin" | "viewer" }[] }) => {
      if (list.owner === userUid) return true;
      const isCollaborator = (list.collaborators || []).some(
        (c: { email: string }) => c.email === userEmail
      );
      
      return isCollaborator;
    });
  
  return allLists;
};

export const deleteTodoList = async (id: string) => {
  await deleteDoc(doc(db, "todoLists", id));
};

export const addTask = async (listId: string, task: { title: string; description: string; createdBy: string }) => {
  await addDoc(collection(db, "todoLists", listId, "tasks"), task);
};

export const getTasks = async (listId: string, userUid: string) => {
  const listRef = doc(db, "todoLists", listId);
  const listSnap = await getDoc(listRef);
  
  if (!listSnap.exists()) {
    return [];
  }
  
  const listData = listSnap.data();
  const userEmail = await getUserEmail(userUid);
  

  const isOwner = listData.owner === userUid;
  const isCollaborator = (listData.collaborators || []).some(
    (c: { email: string }) => c.email === userEmail
  );
  
  if (!isOwner && !isCollaborator) {
    return []; 
  }
  
  const snapshot = await getDocs(collection(db, "todoLists", listId, "tasks"));
  return snapshot.docs.map((doc) => ({ 
    id: doc.id, 
    ...doc.data() 
  }));
};

const getUserEmail = async (userUid: string) => {
  const userDoc = await getDoc(doc(db, "users", userUid));
  if (userDoc.exists()) {
    return userDoc.data().email;
  }
  return null;
};

export const deleteTask = async (listId: string, taskId: string) => {
  await deleteDoc(doc(db, "todoLists", listId, "tasks", taskId));
};

export const toggleTaskCompletion = async (listId: string, taskId: string, completed: boolean) => {
  await updateDoc(doc(db, "todoLists", listId, "tasks", taskId), {
    completed,
  });
};