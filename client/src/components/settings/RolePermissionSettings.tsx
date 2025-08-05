import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Shield, 
  Users, 
  Key, 
  Settings, 
  Eye, 
  Edit, 
  Trash2, 
  Plus,
  Save,
  UserCheck,
  AlertTriangle,
  Lock,
  Unlock,
  Crown,
  CheckCircle,
  XCircle
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

// Role creation schema
const roleSchema = z.object({
  roleName: z.string().min(1, "Role name is required").regex(/^[a-z-]+$/, "Use lowercase letters and hyphens only"),
  displayName: z.string().min(1, "Display name is required"),
  description: z.string().optional(),
  level: z.number().min(1).max(10).default(1),
  isActive: z.boolean().default(true),
});

// Permission categories with icons
const permissionCategories = [
  { key: "properties", label: "Properties", icon: Shield, color: "blue" },
  { key: "leads", label: "Lead Management", icon: Users, color: "green" },
  { key: "customers", label: "Customer Relations", icon: UserCheck, color: "purple" },
  { key: "reports", label: "Reports & Analytics", icon: Settings, color: "orange" },
  { key: "analytics", label: "Analytics", icon: Eye, color: "cyan" },
  { key: "settings", label: "System Settings", icon: Settings, color: "gray" },
  { key: "team", label: "Team Management", icon: Users, color: "pink" },
  { key: "system", label: "System Administration", icon: Crown, color: "red" },
  { key: "billing", label: "Billing & Payments", icon: Key, color: "yellow" },
];

type RoleFormData = z.infer<typeof roleSchema>;

interface Permission {
  id: string;
  permissionKey: string;
  displayName: string;
  description: string;
  category: string;
  isSystemLevel: boolean;
}

interface UserRole {
  id: string;
  roleName: string;
  displayName: string;
  description: string;
  level: number;
  isActive: boolean;
}

interface RolePermission {
  id: string;
  roleId: string;
  permissionId: string;
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
  canAdmin: boolean;
  permission: Permission;
}

export default function RolePermissionSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("roles");
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false);

  // Fetch roles
  const { data: roles, isLoading: rolesLoading } = useQuery<UserRole[]>({
    queryKey: ["/api/admin/roles"],
  });

  // Fetch permissions
  const { data: permissions, isLoading: permissionsLoading } = useQuery<Permission[]>({
    queryKey: ["/api/admin/permissions"],
  });

  // Fetch role permissions for selected role
  const { data: rolePermissions, isLoading: rolePermissionsLoading } = useQuery<RolePermission[]>({
    queryKey: ["/api/admin/roles", selectedRole, "permissions"],
    enabled: !!selectedRole,
  });

  // Fetch team members for role assignment
  const { data: teamMembers } = useQuery({
    queryKey: ["/api/admin/team-members"],
  });

  const form = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      roleName: "",
      displayName: "",
      description: "",
      level: 1,
      isActive: true,
    },
  });

  // Create role mutation
  const createRoleMutation = useMutation({
    mutationFn: (data: RoleFormData) => apiRequest("POST", "/api/admin/roles", data),
    onSuccess: () => {
      toast({
        title: "Role Created",
        description: "New role has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/roles"] });
      setIsCreateRoleOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error Creating Role",
        description: error.message || "Failed to create role.",
        variant: "destructive",
      });
    },
  });

  // Update role permission mutation
  const updateRolePermissionMutation = useMutation({
    mutationFn: ({ roleId, permissionId, permissions }: { 
      roleId: string; 
      permissionId: string; 
      permissions: { canRead: boolean; canWrite: boolean; canDelete: boolean; canAdmin: boolean } 
    }) => apiRequest("PUT", `/api/admin/roles/${roleId}/permissions/${permissionId}`, permissions),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/roles", selectedRole, "permissions"] });
    },
  });

  // Initialize default permissions
  const initializePermissionsMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/admin/permissions/initialize"),
    onSuccess: () => {
      toast({
        title: "Permissions Initialized",
        description: "Default permissions have been created.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/permissions"] });
    },
  });

  const onSubmit = (data: RoleFormData) => {
    createRoleMutation.mutate(data);
  };

  const handlePermissionChange = (permissionId: string, field: string, value: boolean) => {
    if (!selectedRole) return;

    const currentPermission = rolePermissions?.find(rp => rp.permissionId === permissionId);
    const updatedPermissions = {
      canRead: currentPermission?.canRead || false,
      canWrite: currentPermission?.canWrite || false,
      canDelete: currentPermission?.canDelete || false,
      canAdmin: currentPermission?.canAdmin || false,
      [field]: value,
    };

    updateRolePermissionMutation.mutate({
      roleId: selectedRole,
      permissionId,
      permissions: updatedPermissions,
    });
  };

  const getLevelBadgeColor = (level: number) => {
    if (level >= 8) return "bg-red-500";
    if (level >= 6) return "bg-orange-500";
    if (level >= 4) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getCategoryIcon = (category: string) => {
    const cat = permissionCategories.find(c => c.key === category);
    return cat ? cat.icon : Shield;
  };

  const getCategoryColor = (category: string) => {
    const cat = permissionCategories.find(c => c.key === category);
    return cat ? cat.color : "gray";
  };

  if (rolesLoading || permissionsLoading) {
    return <div className="flex justify-center p-8">Loading role and permission settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Role & Permission Management</h3>
          <p className="text-sm text-muted-foreground">
            Manage user roles and control access to different parts of the system.
          </p>
        </div>
        <Button 
          onClick={() => initializePermissionsMutation.mutate()}
          variant="outline"
          size="sm"
          disabled={initializePermissionsMutation.isPending}
        >
          <Settings className="h-4 w-4 mr-2" />
          Initialize Permissions
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="roles">Roles Management</TabsTrigger>
          <TabsTrigger value="permissions">Permission Matrix</TabsTrigger>
          <TabsTrigger value="assignments">User Assignments</TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-md font-medium">System Roles</h4>
            <Dialog open={isCreateRoleOpen} onOpenChange={setIsCreateRoleOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-create-role">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Role
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Role</DialogTitle>
                  <DialogDescription>
                    Define a new role with specific access levels for your team.
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="roleName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Role Name (System)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="property-manager" 
                              {...field}
                              data-testid="input-role-name"
                            />
                          </FormControl>
                          <FormDescription>
                            Use lowercase letters and hyphens only
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="displayName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Display Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Property Manager" 
                              {...field}
                              data-testid="input-display-name"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Role description and responsibilities..." 
                              {...field}
                              data-testid="textarea-role-description"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="level"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Access Level (1-10)</FormLabel>
                          <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value?.toString()}>
                            <FormControl>
                              <SelectTrigger data-testid="select-access-level">
                                <SelectValue placeholder="Select access level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {[...Array(10)].map((_, i) => (
                                <SelectItem key={i + 1} value={(i + 1).toString()}>
                                  Level {i + 1} {i + 1 >= 8 ? "(Admin)" : i + 1 >= 4 ? "(Manager)" : "(User)"}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end space-x-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsCreateRoleOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={createRoleMutation.isPending}
                        data-testid="button-save-role"
                      >
                        {createRoleMutation.isPending ? (
                          <Settings className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="mr-2 h-4 w-4" />
                        )}
                        Create Role
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roles?.map((role) => (
              <Card 
                key={role.id} 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedRole === role.id ? "ring-2 ring-blue-500" : ""
                }`}
                onClick={() => setSelectedRole(role.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium">{role.displayName}</h5>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        className={`text-white ${getLevelBadgeColor(role.level)}`}
                        data-testid={`badge-role-level-${role.id}`}
                      >
                        L{role.level}
                      </Badge>
                      {role.isActive ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{role.description}</p>
                  <div className="text-xs text-muted-foreground">
                    Role: <code>{role.roleName}</code>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-6">
          {selectedRole ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Badge variant="outline">
                  Selected Role: {roles?.find(r => r.id === selectedRole)?.displayName}
                </Badge>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedRole(null)}
                >
                  Clear Selection
                </Button>
              </div>

              {rolePermissionsLoading ? (
                <div className="flex justify-center p-8">Loading permissions...</div>
              ) : (
                <div className="space-y-6">
                  {permissionCategories.map((category) => {
                    const categoryPermissions = permissions?.filter(p => p.category === category.key) || [];
                    if (categoryPermissions.length === 0) return null;

                    const CategoryIcon = category.icon;

                    return (
                      <Card key={category.key}>
                        <CardHeader>
                          <CardTitle className="flex items-center space-x-2">
                            <CategoryIcon className="h-5 w-5" />
                            <span>{category.label}</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {categoryPermissions.map((permission) => {
                              const rolePermission = rolePermissions?.find(rp => rp.permissionId === permission.id);
                              
                              return (
                                <div key={permission.id} className="flex items-center justify-between p-3 border rounded-lg">
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2">
                                      <h6 className="font-medium">{permission.displayName}</h6>
                                      {permission.isSystemLevel && (
                                        <Badge variant="destructive" className="text-xs">
                                          <Crown className="h-3 w-3 mr-1" />
                                          System
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-sm text-muted-foreground">{permission.description}</p>
                                  </div>
                                  
                                  <div className="flex items-center space-x-4">
                                    <div className="flex items-center space-x-2">
                                      <Switch
                                        checked={rolePermission?.canRead || false}
                                        onCheckedChange={(checked) => 
                                          handlePermissionChange(permission.id, "canRead", checked)
                                        }
                                        disabled={updateRolePermissionMutation.isPending}
                                        data-testid={`switch-read-${permission.id}`}
                                      />
                                      <label className="text-xs">Read</label>
                                    </div>
                                    
                                    <div className="flex items-center space-x-2">
                                      <Switch
                                        checked={rolePermission?.canWrite || false}
                                        onCheckedChange={(checked) => 
                                          handlePermissionChange(permission.id, "canWrite", checked)
                                        }
                                        disabled={updateRolePermissionMutation.isPending}
                                        data-testid={`switch-write-${permission.id}`}
                                      />
                                      <label className="text-xs">Write</label>
                                    </div>
                                    
                                    <div className="flex items-center space-x-2">
                                      <Switch
                                        checked={rolePermission?.canDelete || false}
                                        onCheckedChange={(checked) => 
                                          handlePermissionChange(permission.id, "canDelete", checked)
                                        }
                                        disabled={updateRolePermissionMutation.isPending}
                                        data-testid={`switch-delete-${permission.id}`}
                                      />
                                      <label className="text-xs">Delete</label>
                                    </div>
                                    
                                    <div className="flex items-center space-x-2">
                                      <Switch
                                        checked={rolePermission?.canAdmin || false}
                                        onCheckedChange={(checked) => 
                                          handlePermissionChange(permission.id, "canAdmin", checked)
                                        }
                                        disabled={updateRolePermissionMutation.isPending}
                                        data-testid={`switch-admin-${permission.id}`}
                                      />
                                      <label className="text-xs">Admin</label>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h4 className="font-medium mb-2">Select a Role</h4>
                <p className="text-sm text-muted-foreground">
                  Choose a role from the Roles Management tab to configure its permissions.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="assignments" className="space-y-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              User role assignments integrate with your existing Team Management system. 
              You can assign roles to team members to control their access levels.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle>Team Member Role Assignments</CardTitle>
              <CardDescription>
                Assign roles to your team members to control their access to different parts of the system.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Role assignment interface will be integrated with your Team Management system.</p>
                <p className="text-sm mt-2">Navigate to Team Management to assign roles to team members.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}