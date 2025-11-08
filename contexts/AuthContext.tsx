// contexts/AuthContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  UserCredential,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

interface UserProfile {
  uid: string;
  email: string;
  name: string;
  username: string;
  bio?: string;
  avatar?: string;
  institution?: string;
  website?: string;
  socialLinks?: {
    github?: string;
    linkedin?: string;
    twitter?: string;
  };
  followers: string[];
  following: string[];
  starredHubs: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<UserCredential>;
  signUp: (
    email: string,
    password: string,
    name: string,
    username: string
  ) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Generate unique username from email
  const generateUsername = (email: string): string => {
    const baseUsername = email
      .split("@")[0]
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
    return `${baseUsername}${Math.floor(Math.random() * 1000)}`;
  };

  // Create user profile in Firestore
  const createUserProfile = useCallback(
    async (user: User, additionalData: Partial<UserProfile> = {}) => {
      if (!user) return;

      const userRef = doc(db, "users", user.uid);
      const snapshot = await getDoc(userRef);

      if (!snapshot.exists()) {
        const { name, username, ...otherData } = additionalData;
        const defaultUsername = username || generateUsername(user.email || "");

        const userProfile: UserProfile = {
          uid: user.uid,
          email: user.email || "",
          name: name || user.displayName || "Anonymous User",
          username: defaultUsername,
          bio: "",
          avatar: user.photoURL || "",
          institution: "",
          website: "",
          socialLinks: {},
          followers: [],
          following: [],
          starredHubs: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          ...otherData,
        };

        try {
          await setDoc(userRef, userProfile);
          setUserProfile(userProfile);
        } catch (error) {
          console.error("Error creating user profile:", error);
        }
      } else {
        setUserProfile(snapshot.data() as UserProfile);
      }
    },
    []
  );

  // Sign up with email and password
  const signUp = async (
    email: string,
    password: string,
    name: string,
    username: string
  ) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName: name });
    await createUserProfile(result.user, { name, username });
  };

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    await createUserProfile(result.user);
  };

  // Sign out
  const logout = async () => {
    await signOut(auth);
    setUserProfile(null);
  };

  // Update user profile
  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!user || !userProfile) return;

    const userRef = doc(db, "users", user.uid);
    const updatedData = {
      ...data,
      updatedAt: new Date(),
    };

    try {
      await setDoc(userRef, updatedData, { merge: true });
      setUserProfile({ ...userProfile, ...updatedData });
    } catch (error) {
      console.error("Error updating user profile:", error);
    }
  };

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        await createUserProfile(user);
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [createUserProfile]);

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    logout,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
