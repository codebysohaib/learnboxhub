import { createContext, useContext, useState, useEffect } from "react";
import { type User } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

interface MockFirebaseUser {
  email: string;
  displayName: string | null;
  photoURL: string | null;
  uid: string;
}

interface AuthContextType {
  firebaseUser: MockFirebaseUser | null;
  user: User | null;
  loading: boolean;
  login: (fbUser: MockFirebaseUser) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [firebaseUser, setFirebaseUser] = useState<MockFirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const login = async (fbUser: MockFirebaseUser) => {
    try {
      // Check if this is the admin email
      const isAdmin = fbUser.email === "mughalsohaib240@gmail.com";
      
      const response = await apiRequest("POST", "/api/auth/login", {
        email: fbUser.email,
        name: fbUser.displayName,
        avatar: fbUser.photoURL,
        isAdmin: isAdmin,
      });
      const data = await response.json();
      setUser(data.user);
      setFirebaseUser(fbUser);
      localStorage.setItem("auth_token", data.token);
      localStorage.setItem("user_data", JSON.stringify(fbUser));
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const logout = () => {
    setFirebaseUser(null);
    setUser(null);
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
  };

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    const userData = localStorage.getItem("user_data");
    
    if (token && userData) {
      try {
        const parsedUserData = JSON.parse(userData);
        setFirebaseUser(parsedUserData);
        
        // Verify token with backend
        apiRequest("GET", "/api/auth/me")
          .then(response => response.json())
          .then(userInfo => setUser(userInfo))
          .catch(() => {
            localStorage.removeItem("auth_token");
            localStorage.removeItem("user_data");
            setFirebaseUser(null);
          })
          .finally(() => setLoading(false));
      } catch (error) {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user_data");
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ firebaseUser, user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};