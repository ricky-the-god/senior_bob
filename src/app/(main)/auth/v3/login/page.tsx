import { Suspense } from "react";

import { AuthCard, LoginForm } from "../../_components/v3";

export default function LoginPage() {
  return (
    <AuthCard>
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthCard>
  );
}
