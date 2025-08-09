import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, Mail, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const { user, loading, login } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isAdminEmail = email === "mughalsohaib240@gmail.com";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your Gmail address.",
        variant: "destructive",
      });
      return;
    }

    if (!email.includes("@gmail.com")) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid Gmail address.",
        variant: "destructive",
      });
      return;
    }

    if (isAdminEmail && password !== "@sohaibofficial66") {
      toast({
        title: "Invalid admin password",
        description: "Please enter the correct admin password.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // Create a mock user object for the login
      const mockUser = {
        email: email,
        displayName: email.split("@")[0],
        photoURL: null,
        uid: email.replace("@", "_").replace(".", "_")
      };

      await login(mockUser);
      
      toast({
        title: "Login successful",
        description: `Welcome to LearnBox!`,
        variant: "default",
      });
    } catch (error) {
      console.error("Login failed:", error);
      toast({
        title: "Login failed",
        description: "There was an error signing in. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user) {
    return null; // AuthProvider will redirect to dashboard
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <CardTitle className="text-2xl font-bold text-text-primary">LearnBox</CardTitle>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-text-primary">Welcome Back</h2>
            <p className="text-text-secondary">
              Sign in to access your study materials and collaborate with your classmates
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-text-primary">
                Gmail Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full"
              />
            </div>

            {isAdminEmail && (
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-text-primary">
                  Admin Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter admin password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-text-secondary" />
                    ) : (
                      <Eye className="h-4 w-4 text-text-secondary" />
                    )}
                  </Button>
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Mail className="mr-2 h-5 w-5" />
              )}
              {isAdminEmail ? "Sign in as Admin" : "Sign in with Gmail"}
            </Button>
          </form>
          
          <div className="text-center">
            <p className="text-sm text-text-secondary">
              Access your personalized learning experience
            </p>
            {isAdminEmail && (
              <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">
                Admin password required for administrative access
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}