import { collection, addDoc, getDocs, doc, getDoc, updateDoc, query, where, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { CivicIssue, Status, User, NotificationType, Department } from '../types';
import { addNotification, findAdminByDepartment } from './authService';

const issuesCollectionRef = collection(db, 'issues');

// Helper to get all issues from Firestore
export const getIssues = async (): Promise<CivicIssue[]> => {
  const q = query(issuesCollectionRef, orderBy('createdAt', 'desc'));
  const data = await getDocs(q);
  return data.docs.map(doc => ({ ...doc.data(), id: doc.id })) as CivicIssue[];
};

// Get a single issue by its ID
export const getIssueById = async (id: string): Promise<CivicIssue | undefined> => {
  const issueDocRef = doc(db, 'issues', id);
  const issueSnap = await getDoc(issueDocRef);
  if (issueSnap.exists()) {
    return { ...issueSnap.data(), id: issueSnap.id } as CivicIssue;
  }
  return undefined;
};

// Add a new issue
export const addIssue = async (issueData: Omit<CivicIssue, 'id' | 'createdAt' | 'status' | 'userId' | 'userEmail' | 'username' | 'acknowledgedAt' | 'resolvedAt' | 'rating'>, user: User): Promise<{ newIssue: CivicIssue }> => {
  const newIssueData = {
    ...issueData,
    createdAt: serverTimestamp(),
    acknowledgedAt: null,
    resolvedAt: null,
    status: Status.Pending,
    userId: user.id,
    userEmail: user.email,
    username: user.username,
    rating: null,
  };
  
  const docRef = await addDoc(issuesCollectionRef, newIssueData);

  const newIssue: CivicIssue = {
      ...issueData,
      id: docRef.id,
      createdAt: Date.now(), // Use client-side timestamp for immediate return
      status: Status.Pending,
      userId: user.id,
      userEmail: user.email,
      username: user.username,
      acknowledgedAt: null,
      resolvedAt: null,
      rating: null,
  }
  
  // Notify the user who created the issue
  await addNotification(user.id, `Your issue report "${newIssue.title}" has been successfully submitted.`, NotificationType.General);
  
  // Notify the department admin
  const admin = await findAdminByDepartment(newIssue.department);
  if (admin) {
      // In a real app, a Cloud Function would listen for new issues and send this email.
      // For now, we'll create a notification document that the function would act on.
      const emailContent = {
        subject: `New Issue Reported for ${newIssue.department}: #${newIssue.id.slice(-6)}`,
        body: `A new civic issue has been assigned to your department.\n\nIssue Title: ${newIssue.title}\nReported by: ${newIssue.username} (${newIssue.userEmail})\nCategory: ${newIssue.category}\n\nPlease review and update the status in the admin dashboard.`
      };
      await addNotification(admin.id, `New issue "${newIssue.title}" for your department.`, NotificationType.Email, 'email', emailContent);
  }

  return { newIssue };
};

// Update the status of an existing issue
export const updateIssueStatus = async (id: string, newStatus: Status, adminUser: User): Promise<{ updatedIssue: CivicIssue | null; }> => {
  const issueDocRef = doc(db, 'issues', id);
  const issueSnap = await getDoc(issueDocRef);

  if (!issueSnap.exists()) {
    console.error(`Issue with id ${id} not found.`);
    return { updatedIssue: null };
  }
  
  const issueData = issueSnap.data() as CivicIssue;
  const originalStatus = issueData.status;
  if (originalStatus === newStatus) {
    return { updatedIssue: issueData }; // No change
  }

  const updateData: any = { status: newStatus };
  
  if (originalStatus === Status.Pending && (newStatus === Status.InProgress || newStatus === Status.Resolved)) {
    updateData.acknowledgedAt = serverTimestamp();
  }
  if (newStatus === Status.Resolved) {
    updateData.resolvedAt = serverTimestamp();
  }

  await updateDoc(issueDocRef, updateData);
  const updatedIssue = { ...issueData, ...updateData };

  // Notify the admin who made the change
  await addNotification(
      adminUser.id,
      `You have marked the status of the report "${updatedIssue.title}" as ${newStatus}.`,
      NotificationType.General
  );

  // Trigger notification for the original user
  const deliveryMethod: 'email' | 'in-app' = newStatus === Status.Resolved ? 'email' : 'in-app';
  const emailContent = newStatus === Status.Resolved ? {
      subject: `Your Report has been Resolved: "${updatedIssue.title}"`,
      body: `Hello ${updatedIssue.username},\n\nWe're pleased to inform you that your reported issue, "${updatedIssue.title}", has been marked as resolved by the ${updatedIssue.department} department.\n\nThank you for helping improve our community. We would appreciate it if you could take a moment to rate the service you received.`,
      cta: { text: "Rate Service & View Report", link: `#my-reports` }
  } : undefined;
  const message = newStatus === Status.Resolved 
      ? `Your report "${updatedIssue.title}" has been resolved.` 
      : `The status of your report "${updatedIssue.title}" has been updated to "${newStatus}".`;

  await addNotification(updatedIssue.userId, message, NotificationType.StatusUpdate, deliveryMethod, emailContent);
  
  return { updatedIssue };
};

export const addRatingToIssue = async (id: string, rating: number, user: User): Promise<{ updatedIssue: CivicIssue | null; }> => {
    const issueDocRef = doc(db, 'issues', id);
    await updateDoc(issueDocRef, { rating });

    const updatedIssueSnap = await getDoc(issueDocRef);
    if (!updatedIssueSnap.exists()) return { updatedIssue: null };
    const updatedIssue = updatedIssueSnap.data() as CivicIssue;

    // Notify user
    await addNotification(user.id, `Your ${rating}-star rating for "${updatedIssue.title}" has been recorded. Thank you!`, NotificationType.General);

    // Notify department admin
    const admin = await findAdminByDepartment(updatedIssue.department);
    if (admin) {
        await addNotification(admin.id, `A user gave a ${rating}-star rating for the resolved issue: "${updatedIssue.title}".`, NotificationType.RatingReceived);
    }

    return { updatedIssue };
};

export const addFeedbackToIssue = async (id: string, feedback: string, user: User): Promise<{ updatedIssue: CivicIssue | null; }> => {
    const issueDocRef = doc(db, 'issues', id);
    await updateDoc(issueDocRef, { feedback });

    const updatedIssueSnap = await getDoc(issueDocRef);
    if (!updatedIssueSnap.exists()) return { updatedIssue: null };
    const updatedIssue = updatedIssueSnap.data() as CivicIssue;
    
    // Notify user
    await addNotification(user.id, `Your feedback for "${updatedIssue.title}" has been received. Thank you!`, NotificationType.FeedbackReceived);

    // Notify department admin
    const admin = await findAdminByDepartment(updatedIssue.department);
    if (admin) {
        const truncatedFeedback = feedback.length > 50 ? `${feedback.substring(0, 50)}...` : feedback;
        const ratingText = updatedIssue.rating ? ` — Rating: ${updatedIssue.rating} ★` : '';
        
        await addNotification(
            admin.id,
            `New feedback from ${updatedIssue.username}: "${truncatedFeedback}"${ratingText}`,
            NotificationType.FeedbackReceived
        );
    }

    return { updatedIssue };
};