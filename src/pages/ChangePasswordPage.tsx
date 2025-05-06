
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserLayout } from "@/components/UserLayout";
import { Heading } from "@/components/ui/heading";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PasswordChangeForm } from "@/components/auth/PasswordChangeForm";
import { Lock } from "lucide-react";

const ChangePasswordPage = () => {
  const navigate = useNavigate();

  return (
    <UserLayout>
      <div className="container py-8 max-w-2xl mx-auto">
        <Heading
          title="Change Password"
          description="Update your account password"
          icon={<Lock className="h-6 w-6" />}
        />
        
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Update Password</CardTitle>
            <CardDescription>
              Choose a strong password that you don't use elsewhere
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PasswordChangeForm />
          </CardContent>
        </Card>
      </div>
    </UserLayout>
  );
};

export default ChangePasswordPage;
