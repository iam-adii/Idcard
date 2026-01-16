
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, ShieldCheck } from "lucide-react";
import { DottedSurface } from "@/components/ui/dotted-surface";

const Login = () => {
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const isAuthenticated = localStorage.getItem("isAuthenticated");
        if (isAuthenticated) {
            navigate("/creator");
        }
    }, [navigate]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === "2362") {
            localStorage.setItem("isAuthenticated", "true");
            toast.success("Login successful");
            navigate("/creator");
        } else {
            toast.error("Incorrect password");
        }
    };

    return (
        <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
            {/* Left Column - Visuals */}
            <div className="hidden lg:flex relative flex-col justify-center items-center bg-zinc-900 p-10 text-white dark:border-r overflow-hidden">
                <DottedSurface className="bg-zinc-900" themeOverride="dark" />

                {/* Header */}
                <div className="absolute top-10 left-10 z-10 flex items-center gap-2 text-lg font-medium">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-white/10 text-white">
                        <CreditCard className="size-4" />
                    </div>
                    ID Card Creator
                </div>

                {/* Hero Content */}
                <div className="relative z-10 space-y-8 text-left max-w-2xl">
                    <div className="space-y-4">
                        <h2 className="text-4xl font-bold tracking-tight">
                            Secure <span className="text-primary-foreground/90">Enterprise</span> <br />
                            Identity Management
                        </h2>
                        <p className="text-sm max-w-sm" style={{ fontSize: '14px', color: 'rgba(214, 214, 214, 0.8)' }}>
                            Create, manage, and export professional employee ID cards with our secure and intuitive platform.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Column - Login Form */}
            <div className="flex items-center justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 bg-background">
                <div className="mx-auto w-full max-w-sm space-y-4 sm:space-y-6">
                    <div className="flex flex-col space-y-2 text-center">
                        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Welcome back</h1>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                            Enter the access code to continue
                        </p>
                    </div>

                    <Card className="border-border/50 shadow-lg">
                        <CardHeader className="p-4 sm:p-6">
                            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                                <ShieldCheck className="size-4 sm:size-5 text-primary" />
                                Authentication
                            </CardTitle>
                            <CardDescription className="text-xs sm:text-sm">
                                Please enter the secure password to access the dashboard.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6 pt-0">
                            <form onSubmit={handleLogin} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-sm">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="bg-background/50 h-11 sm:h-10 text-base sm:text-sm min-h-[44px] sm:min-h-0"
                                    />
                                </div>
                                <Button type="submit" className="w-full min-h-[44px] sm:min-h-0 h-11 sm:h-10 text-base sm:text-sm">
                                    Sign In
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Login;
