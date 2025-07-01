// app/password/page.tsx

import Password from "@/components/Password";

export default function PasswordPage() {
  return (
    <main className="flex justify-center items-center min-h-[88vh] bg-gray-100">
      <div className="bg-white p-10 rounded-lg shadow-md w-full max-w-xl">
        <Password />
      </div>
    </main>
  );
}
