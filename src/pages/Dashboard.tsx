
import { useEffect, useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { format, formatDistanceToNow } from "date-fns";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import {
    CreditCard,
    Users,
    Files,
    ArrowUpRight,
    Plus,
    ArrowRight,
} from "lucide-react";
import { getAllIDCards, getAllTemplates, type SavedIDCard } from "@/lib/storage";

const Dashboard = () => {
    const navigate = useNavigate();
    const [idCards, setIdCards] = useState<SavedIDCard[]>([]);
    const [templates, setTemplates] = useState<Awaited<ReturnType<typeof getAllTemplates>>>([]);

    useEffect(() => {
        const isAuthenticated = localStorage.getItem("isAuthenticated");
        if (!isAuthenticated) {
            navigate("/");
            return;
        }

        // Load data from storage
        loadData();
    }, [navigate]);

    const loadData = async () => {
        const cards = await getAllIDCards();
        // Cards are already sorted by createdAt descending from storage
        setIdCards(cards);

        const savedTemplates = await getAllTemplates();
        setTemplates(savedTemplates);
    };

    // Calculate metrics
    const metrics = useMemo(() => {
        const totalCards = idCards.length;
        const uniqueEmployees = new Set(idCards.map(card => card.employeeData.empId)).size;
        const uniqueTemplates = new Set(
            idCards
                .map(card => card.templateId)
                .filter((id): id is string => !!id)
        ).size;

        return [
            {
                title: "Total ID Cards",
                value: totalCards.toLocaleString(),
                change: "",
                icon: CreditCard,
            },
            {
                title: "Active Employees",
                value: uniqueEmployees.toLocaleString(),
                change: "",
                icon: Users,
            },
            {
                title: "Templates Used",
                value: uniqueTemplates.toLocaleString(),
                change: "",
                icon: Files,
            },
        ];
    }, [idCards]);

    // Get recent activity (last 5 cards)
    const recentActivity = useMemo(() => {
        return idCards.slice(0, 5).map((card) => {
            const template = templates.find((t) => t.id === card.templateId);
            const templateName = template?.name || "Default Template";

            let dateDisplay: string;
            try {
                const date = new Date(card.createdAt);
                const now = new Date();
                const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

                if (diffInHours < 1) {
                    dateDisplay = "Just now";
                } else if (diffInHours < 24) {
                    dateDisplay = formatDistanceToNow(date, { addSuffix: true });
                } else {
                    dateDisplay = format(date, "MMM dd, yyyy");
                }
            } catch {
                dateDisplay = card.createdAt;
            }

            return {
                id: card.id,
                name: card.employeeData.empId || "Unknown",
                department: card.employeeData.bloodGroup || "—",
                template: templateName,
                date: dateDisplay,
                status: "Generated",
            };
        });
    }, [idCards, templates]);

    // Get featured templates (first 3)
    const featuredTemplates = useMemo(() => {
        const templateColors = [
            "bg-blue-500",
            "bg-purple-500",
            "bg-zinc-800",
            "bg-green-500",
            "bg-orange-500",
        ];

        return templates.slice(0, 3).map((template, index) => ({
            id: template.id,
            name: template.name,
            category: template.category,
            color: templateColors[index % templateColors.length],
        }));
    }, [templates]);

    return (
        <>
            <AppSidebar />
            <SidebarInset>
                {/* Header */}
                <header className="sticky top-0 z-40 flex h-14 sm:h-16 shrink-0 items-center justify-between border-b bg-background/95 backdrop-blur px-2 sm:px-4 shadow-sm lg:px-8">
                    <div className="flex items-center gap-2 min-w-0">
                        <SidebarTrigger className="-ml-1 h-10 w-10 sm:h-9 sm:w-9" />
                        <span className="text-base sm:text-lg font-semibold truncate">Dashboard</span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                        <Button
                            size="sm"
                            className="hidden sm:flex min-h-[44px] sm:min-h-0"
                            onClick={() => navigate("/creator")}
                        >
                            <Plus className="mr-2 size-4" />
                            New ID Card
                        </Button>
                    </div>
                </header>

                <div className="flex flex-1 flex-col gap-4 sm:gap-8 p-2 sm:p-4 pt-4 sm:pt-8 md:p-8">
                    {/* Metrics Grid */}
                    <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-3 md:gap-8">
                        {metrics.map((metric) => (
                            <Card key={metric.title} className="shadow-sm">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
                                    <CardTitle className="text-xs sm:text-sm font-medium">
                                        {metric.title}
                                    </CardTitle>
                                    <metric.icon className="size-3.5 sm:size-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent className="p-4 sm:p-6 pt-0">
                                    <div className="text-xl sm:text-2xl font-bold">{metric.value}</div>
                                    {metric.change && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                            <span className="text-emerald-500 font-medium">{metric.change}</span> from last month
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-7 md:gap-8">
                        {/* Recent Activity Table */}
                        <Card className="col-span-1 lg:col-span-4 shadow-sm">
                            <CardHeader className="flex flex-row items-center p-4 sm:p-6">
                                <div className="grid gap-1 sm:gap-2 min-w-0 flex-1">
                                    <CardTitle className="text-sm sm:text-base">Recent Activity</CardTitle>
                                    <CardDescription className="text-xs sm:text-sm">
                                        Latest ID card generations and updates.
                                    </CardDescription>
                                </div>
                                <Button asChild size="sm" className="ml-auto gap-1 shrink-0 min-h-[44px] sm:min-h-0 h-11 sm:h-9" variant="ghost">
                                    <Link to="/id-cards" className="text-xs sm:text-sm">
                                        <span className="hidden sm:inline">View All</span>
                                        <span className="sm:hidden">All</span>
                                        <ArrowUpRight className="size-3.5 sm:size-4 ml-1" />
                                    </Link>
                                </Button>
                            </CardHeader>
                            <CardContent className="p-4 sm:p-6 pt-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Employee</TableHead>
                                            <TableHead className="hidden sm:table-cell">Status</TableHead>
                                            <TableHead className="hidden md:table-cell">Template</TableHead>
                                            <TableHead className="text-right">Date</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {recentActivity.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                                    No ID cards created yet. Create your first one to get started.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            recentActivity.map((item) => (
                                                <TableRow key={item.id}>
                                                    <TableCell>
                                                        <div className="font-medium">{item.name}</div>
                                                        <div className="hidden text-sm text-muted-foreground md:inline">
                                                            {item.department}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="hidden sm:table-cell">
                                                        <Badge variant={item.status === "Generated" ? "secondary" : "outline"}>
                                                            {item.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="hidden md:table-cell">
                                                        {item.template}
                                                    </TableCell>
                                                    <TableCell className="text-right text-muted-foreground">
                                                        {item.date}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>

                        {/* Templates Section */}
                        <Card className="col-span-1 lg:col-span-3 shadow-sm">
                            <CardHeader className="p-4 sm:p-6">
                                <CardTitle className="text-sm sm:text-base">Featured Templates</CardTitle>
                                <CardDescription className="text-xs sm:text-sm">
                                    Popular designs for your organization.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-3 sm:gap-4 p-4 sm:p-6 pt-0">
                                {featuredTemplates.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground text-sm">
                                        No templates available. Add templates to get started.
                                    </div>
                                ) : (
                                    featuredTemplates.map((template) => (
                                        <div
                                            key={template.id}
                                            className="flex items-center gap-3 sm:gap-4 rounded-lg border p-3 hover:bg-accent/50 transition-colors cursor-pointer min-h-[60px] sm:min-h-0"
                                            onClick={() => navigate("/templates")}
                                        >
                                            <div className={`size-10 sm:size-12 rounded-md ${template.color} opacity-80 shrink-0`} />
                                            <div className="grid gap-1 min-w-0 flex-1">
                                                <p className="font-medium leading-none text-sm sm:text-base truncate">{template.name}</p>
                                                <p className="text-xs sm:text-sm text-muted-foreground">
                                                    {template.category}
                                                </p>
                                            </div>
                                            <Button variant="ghost" size="icon" className="ml-auto shrink-0 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 h-11 w-11 sm:h-10 sm:w-10">
                                                <ArrowRight className="size-4" />
                                            </Button>
                                        </div>
                                    ))
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </SidebarInset>
        </>
    );
};

export default Dashboard;
