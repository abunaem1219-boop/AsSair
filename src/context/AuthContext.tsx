import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as fbSignOut,
  sendPasswordResetEmail,
  updateProfile as fbUpdateProfile,
  updatePassword as fbUpdatePassword,
} from 'firebase/auth';
import { ref, get, set, update, onValue } from 'firebase/database';
import { auth, rtdb, INITIAL_SUPER_ADMIN_UID } from '../firebase/config';
import { UserProfile, Role, PermissionCapability, OrgSettings } from '../types';
import { sanitizeForRTDB } from '../utils/firebaseUtils';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  role: Role;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  isModerator: boolean;
  isConnected: boolean;
  loading: boolean;
  hasPermission: (capability: PermissionCapability) => boolean;
  login: (email: string, pass: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (email: string, pass: string, name: string, phone: string, memberId?: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserPassword: (newPass: string) => Promise<void>;
  updateUserProfileData: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [loading, setLoading] = useState(true);
  const [permissionsSettings, setPermissionsSettings] = useState<OrgSettings['permissions']>({});

  // Monitor Firebase Realtime Database connection state
  useEffect(() => {
    const connectedRef = ref(rtdb, '.info/connected');
    const unsubscribe = onValue(connectedRef, (snapshot) => {
      setIsConnected(snapshot.val() === true);
    });
    return () => unsubscribe();
  }, []);

  // Listen to permissions configuration in settings
  useEffect(() => {
    const permRef = ref(rtdb, 'settings/permissions');
    const unsubscribe = onValue(permRef, (snapshot) => {
      if (snapshot.exists()) {
        setPermissionsSettings(snapshot.val());
      }
    });
    return () => unsubscribe();
  }, []);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setCurrentUser(fbUser);
      if (fbUser) {
        try {
          const userRef = ref(rtdb, `users/${fbUser.uid}`);
          const snapshot = await get(userRef);
          
          const isInitialSuperAdmin = fbUser.uid === INITIAL_SUPER_ADMIN_UID;
          
          if (snapshot.exists()) {
            const data = snapshot.val() as UserProfile;
            // Ensure permanent superAdmin role for the initial UID
            if (isInitialSuperAdmin && data.role !== 'superAdmin') {
              data.role = 'superAdmin';
              await update(userRef, { role: 'superAdmin' });
            }
            setUserProfile(data);
          } else {
            // First time login for this user - create profile in Realtime Database
            const defaultRole: Role = isInitialSuperAdmin ? 'superAdmin' : 'member';
            const now = Date.now();
            const newProfile: UserProfile = {
              uid: fbUser.uid,
              email: fbUser.email || '',
              displayName: fbUser.displayName || (isInitialSuperAdmin ? 'Super Administrator' : 'Member'),
              photoURL: fbUser.photoURL || '',
              role: defaultRole,
              phone: '',
              joinDate: new Date().toISOString().split('T')[0],
              isActive: true,
              status: 'active',
              language: 'bn',
              totalDeposit: 0,
              createdAt: now,
              updatedAt: now,
            };
            await set(userRef, sanitizeForRTDB(newProfile));
            setUserProfile(newProfile);

            // Also synchronize corresponding member record if not existing
            const memberRef = ref(rtdb, `members/${fbUser.uid}`);
            const memberSnap = await get(memberRef);
            if (!memberSnap.exists()) {
              const memberEntry = {
                id: fbUser.uid,
                uid: fbUser.uid,
                memberId: `AS-${Math.floor(100 + Math.random() * 900)}`,
                name: newProfile.displayName,
                phone: '',
                email: newProfile.email,
                photoUrl: newProfile.photoURL || '',
                joinDate: newProfile.joinDate,
                role: defaultRole,
                status: 'active',
                totalDeposit: 0,
                createdAt: now,
                updatedAt: now,
              };
              await set(memberRef, sanitizeForRTDB(memberEntry));
            }
          }
        } catch (err) {
          console.error('Error fetching user profile from RTDB:', err);
          const isInitialSuperAdmin = fbUser.uid === INITIAL_SUPER_ADMIN_UID;
          setUserProfile({
            uid: fbUser.uid,
            email: fbUser.email || '',
            displayName: fbUser.displayName || 'User',
            photoURL: fbUser.photoURL || '',
            role: isInitialSuperAdmin ? 'superAdmin' : 'member',
            joinDate: new Date().toISOString().split('T')[0],
            isActive: true,
            status: 'active',
          });
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const result = await signInWithPopup(auth, provider);
    const fbUser = result.user;

    const isInitialSuperAdmin = fbUser.uid === INITIAL_SUPER_ADMIN_UID;
    const userRef = ref(rtdb, `users/${fbUser.uid}`);
    const snapshot = await get(userRef);

    if (!snapshot.exists()) {
      const now = Date.now();
      const defaultRole: Role = isInitialSuperAdmin ? 'superAdmin' : 'member';
      const profile: UserProfile = {
        uid: fbUser.uid,
        email: fbUser.email || '',
        displayName: fbUser.displayName || 'Google Member',
        photoURL: fbUser.photoURL || '',
        phone: fbUser.phoneNumber || '',
        memberId: `AS-${Math.floor(100 + Math.random() * 900)}`,
        role: defaultRole,
        joinDate: new Date().toISOString().split('T')[0],
        isActive: true,
        status: 'active',
        language: 'bn',
        totalDeposit: 0,
        createdAt: now,
        updatedAt: now,
      };

      await set(userRef, sanitizeForRTDB(profile));
      setUserProfile(profile);

      // Create linked member record
      const memberRef = ref(rtdb, `members/${fbUser.uid}`);
      await set(
        memberRef,
        sanitizeForRTDB({
          id: fbUser.uid,
          uid: fbUser.uid,
          memberId: profile.memberId || 'AS-001',
          name: profile.displayName,
          phone: profile.phone || '',
          email: profile.email,
          photoUrl: profile.photoURL || '',
          joinDate: profile.joinDate,
          role: defaultRole,
          status: 'active',
          totalDeposit: 0,
          createdAt: now,
          updatedAt: now,
        })
      );
    }
  };

  const register = async (email: string, pass: string, name: string, phone: string, memberId?: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const fbUser = userCredential.user;
    
    // Update display name in Firebase Auth
    await fbUpdateProfile(fbUser, { displayName: name });

    const isInitialSuperAdmin = fbUser.uid === INITIAL_SUPER_ADMIN_UID;
    const role: Role = isInitialSuperAdmin ? 'superAdmin' : 'member';
    const now = Date.now();

    const profile: UserProfile = {
      uid: fbUser.uid,
      email: fbUser.email || email,
      displayName: name,
      photoURL: '',
      phone: phone || '',
      memberId: memberId || `AS-${Math.floor(100 + Math.random() * 900)}`,
      role,
      joinDate: new Date().toISOString().split('T')[0],
      isActive: true,
      status: 'active',
      language: 'bn',
      totalDeposit: 0,
      createdAt: now,
      updatedAt: now,
    };

    // Save profile to RTDB
    await set(ref(rtdb, `users/${fbUser.uid}`), sanitizeForRTDB(profile));
    setUserProfile(profile);

    // Also create or sync corresponding entry in members list
    const memberEntry = {
      id: fbUser.uid,
      uid: fbUser.uid,
      memberId: profile.memberId || 'AS-001',
      name,
      photoUrl: '',
      phone: phone || '',
      email,
      joinDate: profile.joinDate,
      role,
      status: 'active',
      totalDeposit: 0,
      createdAt: now,
      updatedAt: now,
    };
    await set(ref(rtdb, `members/${fbUser.uid}`), sanitizeForRTDB(memberEntry));
  };

  const logout = async () => {
    await fbSignOut(auth);
    setUserProfile(null);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const updateUserPassword = async (newPass: string) => {
    if (auth.currentUser) {
      await fbUpdatePassword(auth.currentUser, newPass);
    }
  };

  const updateUserProfileData = async (data: Partial<UserProfile>) => {
    if (!currentUser) return;
    
    // Protect role modification from normal users
    if (data.role && currentUser.uid !== INITIAL_SUPER_ADMIN_UID && userProfile?.role !== 'superAdmin') {
      delete data.role;
    }

    const payload = {
      ...data,
      updatedAt: Date.now(),
    };

    const userRef = ref(rtdb, `users/${currentUser.uid}`);
    await update(userRef, sanitizeForRTDB(payload));
    setUserProfile((prev) => (prev ? { ...prev, ...payload } : null));

    // Also sync display name or photo to members record if present
    if (data.displayName || data.photoURL || data.phone) {
      const memberUpdates: Record<string, any> = { updatedAt: Date.now() };
      if (data.displayName) memberUpdates.name = data.displayName;
      if (data.photoURL) memberUpdates.photoUrl = data.photoURL;
      if (data.phone) memberUpdates.phone = data.phone;
      await update(ref(rtdb, `members/${currentUser.uid}`), sanitizeForRTDB(memberUpdates)).catch(() => {});
    }

    if (data.displayName && auth.currentUser) {
      await fbUpdateProfile(auth.currentUser, { displayName: data.displayName });
    }
  };

  const role: Role = (currentUser?.uid === INITIAL_SUPER_ADMIN_UID) 
    ? 'superAdmin' 
    : (userProfile?.role || 'member');

  const isSuperAdmin = role === 'superAdmin';
  const isAdmin = role === 'superAdmin' || role === 'admin';
  const isModerator = isAdmin || role === 'moderator';

  // Dynamic granular permission checker
  const hasPermission = (capability: PermissionCapability): boolean => {
    if (isSuperAdmin) return true; // Super Admin has all capabilities

    // Check configured permissions from settings if available
    const roleConfig = permissionsSettings?.[role];
    if (roleConfig && typeof roleConfig[capability] === 'boolean') {
      return roleConfig[capability] as boolean;
    }

    // Default permission capability matrices
    if (role === 'admin') {
      if (capability === 'manageRoles') return false; // Only Super Admin manages roles by default
      return true; // Admin has all financial, member, notice, and content capabilities
    }

    if (role === 'moderator') {
      return [
        'moderateChat',
        'moderateFeed',
        'manageGallery',
        'manageEvents',
        'manageNotices',
      ].includes(capability);
    }

    // Member: read-only for general, manages only own content
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        role,
        isSuperAdmin,
        isAdmin,
        isModerator,
        isConnected,
        loading,
        hasPermission,
        login,
        loginWithGoogle,
        register,
        logout,
        resetPassword,
        updateUserPassword,
        updateUserProfileData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
