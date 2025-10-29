import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Mail, Phone, Star } from "lucide-react";

const vendors = [
  {
    id: "V-001",
    name: "PT Tech Solutions Indonesia",
    category: "IT Equipment",
    rating: 4.8,
    email: "sales@techsolutions.id",
    phone: "+62 21 1234 5678",
    totalOrders: 24,
  },
  {
    id: "V-002",
    name: "CV Mebel Jaya",
    category: "Furniture",
    rating: 4.5,
    email: "info@mebeljaya.com",
    phone: "+62 22 9876 5432",
    totalOrders: 15,
  },
  {
    id: "V-003",
    name: "PT Software Licensing Co",
    category: "Software",
    rating: 4.9,
    email: "contact@softwarelicensing.id",
    phone: "+62 21 5555 7777",
    totalOrders: 32,
  },
  {
    id: "V-004",
    name: "UD Elektronik Sejahtera",
    category: "Electronics",
    rating: 4.6,
    email: "sales@elektroniksejahtera.com",
    phone: "+62 31 8888 9999",
    totalOrders: 18,
  },
];

export default function Vendors() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Vendor Management</h1>
          <p className="text-muted-foreground">Kelola dan monitor vendor partner</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {vendors.map((vendor) => (
            <Card
              key={vendor.id}
              className="shadow-md hover:shadow-xl transition-all duration-300 hover:border-primary/30"
            >
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/10 to-primary-glow/10 flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold">{vendor.name}</h3>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {vendor.category}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-warning text-warning" />
                      <span className="font-semibold">{vendor.rating}</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      <span>{vendor.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      <span>{vendor.phone}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">ID Vendor</span>
                      <span className="font-mono font-semibold">{vendor.id}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-2">
                      <span className="text-muted-foreground">Total Orders</span>
                      <span className="font-semibold text-primary">{vendor.totalOrders}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
