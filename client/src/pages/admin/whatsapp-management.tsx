
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  MessageSquare, 
  Send, 
  Users, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Phone,
  Download,
  Filter,
  Search,
  MoreVertical,
  Copy,
  Eye,
  UserPlus,
  Zap
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import AdminLayout from "@/components/layout/admin-layout";

interface WhatsAppTemplate {
  id: string;
  name: string;
  description: string;
  variables: string[];
}

interface WhatsAppStats {
  totalMessagesSent: number;
  totalDelivered: number;
  totalRead: number;
  totalReplies: number;
  deliveryRate: number;
  readRate: number;
  replyRate: number;
  topPerformingTemplate: string;
  activeContacts: number;
  optedOutContacts: number;
}

export default function WhatsAppManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [messageText, setMessageText] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [templateParams, setTemplateParams] = useState<Record<string, string>>({});

  // Fetch WhatsApp templates
  const { data: templates = [] } = useQuery<WhatsAppTemplate[]>({
    queryKey: ["/api/whatsapp/templates"],
  });

  // Fetch campaign statistics
  const { data: stats } = useQuery<WhatsAppStats>({
    queryKey: ["/api/whatsapp/campaign-stats"],
  });

  // Fetch customers for messaging
  const { data: customers = [] } = useQuery({
    queryKey: ["/api/customers"],
  });

  // Send individual message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (data: { phoneNumber: string; message: string; customerName?: string }) =>
      apiRequest("POST", "/api/whatsapp/send-message", data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "WhatsApp message sent successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/whatsapp/campaign-stats"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send WhatsApp message. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Send bulk messages mutation
  const sendBulkMessageMutation = useMutation({
    mutationFn: (data: { contacts: any[]; message: string; messageType: string }) =>
      apiRequest("POST", "/api/whatsapp/send-bulk", data),
    onSuccess: (data) => {
      toast({
        title: "Bulk Message Sent",
        description: `${data.totalSent} messages sent successfully, ${data.totalFailed} failed.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/whatsapp/campaign-stats"] });
      setSelectedContacts([]);
      setMessageText("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send bulk messages. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Send template message mutation
  const sendTemplateMutation = useMutation({
    mutationFn: (data: { phoneNumber: string; templateName: string; params: any; customerName?: string }) =>
      apiRequest("POST", "/api/whatsapp/send-template", data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Template message sent successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/whatsapp/campaign-stats"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send template message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = (phoneNumber: string, customerName: string) => {
    if (!messageText.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message to send.",
        variant: "destructive",
      });
      return;
    }

    sendMessageMutation.mutate({
      phoneNumber,
      message: messageText,
      customerName,
    });
  };

  const handleSendBulkMessage = () => {
    if (selectedContacts.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one contact.",
        variant: "destructive",
      });
      return;
    }

    if (!messageText.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message to send.",
        variant: "destructive",
      });
      return;
    }

    const contactsData = selectedContacts.map(contactId => {
      const customer = customers.find(c => c.id === contactId);
      return {
        phoneNumber: customer?.phone,
        name: customer?.name,
        propertyName: customer?.interestedProperties?.[0],
        daysSinceInquiry: Math.floor((Date.now() - new Date(customer?.lastActivity).getTime()) / (1000 * 60 * 60 * 24))
      };
    }).filter(contact => contact.phoneNumber);

    sendBulkMessageMutation.mutate({
      contacts: contactsData,
      message: messageText,
      messageType: "custom"
    });
  };

  const getTemplateMessage = (templateId: string, customerName: string, propertyName?: string) => {
    switch (templateId) {
      case "property_inquiry":
        return `Hi ${customerName}! 👋\n\nThank you for your interest in ${propertyName || 'our properties'}.\n\nOur property advisor will contact you within 2 hours to:\n🏡 Share detailed property information\n📅 Schedule a site visit\n💰 Discuss pricing and offers\n📋 Answer all your questions\n\nNeed immediate assistance? Reply to this message or call us at +91 98765 43210.\n\nBest regards,\nOwnItRight Team`;
      
      case "follow_up":
        return `Hi ${customerName}! 👋\n\nHope you're doing well! It's been a few days since you showed interest in ${propertyName || 'our properties'}.\n\n📈 Recent updates:\n• Price might change soon\n• Limited units available\n• New amenities announced\n\nWould you like to:\n🏡 Schedule a site visit?\n📞 Speak with our advisor?\n📋 Get the latest pricing?\n\nJust reply with your preference!\n\nBest regards,\nOwnItRight Team`;
      
      default:
        return messageText;
    }
  };

  return (
    <AdminLayout title="WhatsApp Management" showBackButton={false}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <MessageSquare className="h-8 w-8 text-green-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">WhatsApp Management</h1>
              <p className="text-gray-600">Manage customer communication and campaigns</p>
            </div>
          </div>
          <Button className="bg-green-600 hover:bg-green-700">
            <Zap className="h-4 w-4 mr-2" />
            Create Campaign
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Messages Sent</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalMessagesSent?.toLocaleString() || 0}</p>
                </div>
                <Send className="h-8 w-8 text-blue-600" />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                <span className="text-green-600">↗ {stats?.deliveryRate?.toFixed(1) || 0}%</span> delivery rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Contacts</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.activeContacts?.toLocaleString() || 0}</p>
                </div>
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                <span className="text-red-600">{stats?.optedOutContacts || 0}</span> opted out
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Read Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.readRate?.toFixed(1) || 0}%</p>
                </div>
                <Eye className="h-8 w-8 text-purple-600" />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                <span className="text-green-600">{stats?.totalRead || 0}</span> messages read
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Reply Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.replyRate?.toFixed(1) || 0}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                <span className="text-green-600">{stats?.totalReplies || 0}</span> replies received
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contact List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Customer Contacts</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Input 
                      placeholder="Search customers..." 
                      className="w-64"
                    />
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  Select customers to send messages. {selectedContacts.length} selected.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {customers.map((customer) => (
                    <div 
                      key={customer.id}
                      className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedContacts.includes(customer.id) 
                          ? 'bg-green-50 border-green-200' 
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => {
                        setSelectedContacts(prev => 
                          prev.includes(customer.id)
                            ? prev.filter(id => id !== customer.id)
                            : [...prev, customer.id]
                        );
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          selectedContacts.includes(customer.id) ? 'bg-green-500' : 'bg-gray-300'
                        }`} />
                        <div>
                          <p className="font-medium text-gray-900">{customer.name}</p>
                          <p className="text-sm text-gray-500">{customer.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={customer.status === 'hot' ? 'destructive' : customer.status === 'warm' ? 'default' : 'secondary'}>
                          {customer.status}
                        </Badge>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                              <Send className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Send Message to {customer.name}</DialogTitle>
                              <DialogDescription>
                                Send a direct WhatsApp message to this customer.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="message">Message</Label>
                                <Textarea
                                  id="message"
                                  placeholder="Type your message here..."
                                  value={messageText}
                                  onChange={(e) => setMessageText(e.target.value)}
                                  rows={4}
                                />
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button 
                                  onClick={() => handleSendMessage(customer.phone, customer.name)}
                                  disabled={sendMessageMutation.isPending}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  {sendMessageMutation.isPending ? "Sending..." : "Send Message"}
                                </Button>
                                <Button variant="outline" onClick={() => setMessageText("")}>
                                  Clear
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Message Composer */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Send messages using templates or custom text</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Tabs defaultValue="custom" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="custom">Custom</TabsTrigger>
                    <TabsTrigger value="template">Template</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="custom" className="space-y-4">
                    <div>
                      <Label htmlFor="custom-message">Custom Message</Label>
                      <Textarea
                        id="custom-message"
                        placeholder="Type your message here... Use {name} for customer name"
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        rows={4}
                      />
                    </div>
                    <Button 
                      onClick={handleSendBulkMessage}
                      disabled={sendBulkMessageMutation.isPending || selectedContacts.length === 0}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      {sendBulkMessageMutation.isPending ? "Sending..." : `Send to ${selectedContacts.length} contacts`}
                    </Button>
                  </TabsContent>
                  
                  <TabsContent value="template" className="space-y-4">
                    <div>
                      <Label htmlFor="template-select">Select Template</Label>
                      <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a template" />
                        </SelectTrigger>
                        <SelectContent>
                          {templates.map((template) => (
                            <SelectItem key={template.id} value={template.id}>
                              {template.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {selectedTemplate && (
                      <div className="space-y-3">
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">
                            {templates.find(t => t.id === selectedTemplate)?.description}
                          </p>
                        </div>
                        <Button 
                          onClick={() => {
                            const template = templates.find(t => t.id === selectedTemplate);
                            if (template) {
                              setMessageText(getTemplateMessage(template.id, "{name}", "Sample Property"));
                            }
                          }}
                          variant="outline" 
                          className="w-full"
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Template
                        </Button>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Campaign Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Campaign Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Delivery Rate</span>
                    <span className="text-sm font-medium">{stats?.deliveryRate?.toFixed(1) || 0}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Read Rate</span>
                    <span className="text-sm font-medium">{stats?.readRate?.toFixed(1) || 0}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Reply Rate</span>
                    <span className="text-sm font-medium">{stats?.replyRate?.toFixed(1) || 0}%</span>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <p className="text-sm text-gray-600 mb-2">Top Template</p>
                  <Badge variant="outline">{stats?.topPerformingTemplate || "None"}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
