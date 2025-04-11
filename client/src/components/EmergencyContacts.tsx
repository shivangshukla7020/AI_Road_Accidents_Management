import { useQuery } from "@tanstack/react-query";
import { EmergencyContact } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Phone } from "lucide-react";

export default function EmergencyContacts() {
  const { data: contacts, isLoading } = useQuery<EmergencyContact[]>({
    queryKey: ['/api/emergency-contacts'],
  });

  return (
    <Card>
      <CardHeader className="bg-red-500 text-white">
        <CardTitle className="text-lg font-medium">Emergency Contacts</CardTitle>
        <p className="text-sm opacity-80">Click to call</p>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-4">
          {isLoading ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="border-b pb-3">
                <div className="flex justify-between items-center">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-8 w-20" />
                </div>
              </div>
            ))
          ) : contacts && contacts.length > 0 ? (
            contacts.map((contact, index) => (
              <div key={contact.id} className={index < contacts.length - 1 ? "border-b pb-3" : ""}>
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">{contact.name}</h4>
                    <p className="text-sm text-gray-500">{contact.department}</p>
                  </div>
                  <a 
                    href={`tel:${contact.phoneNumber}`} 
                    className={`${contact.buttonColor} text-white px-3 py-2 rounded-md flex items-center text-sm`}
                  >
                    <Phone className="w-4 h-4 mr-1" />
                    Call
                  </a>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500">No emergency contacts available</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
