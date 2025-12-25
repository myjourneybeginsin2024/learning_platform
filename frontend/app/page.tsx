import Image from "next/image";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function Home() {
  return (
    <ProtectedRoute requireAuth={false}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
        <div className="bg-red-500 text-white p-4 mb-4 rounded-lg">
          <p className="font-bold">TAILWIND CSS IS WORKING - VISUAL TEST</p>
        </div>
        <main className="flex flex-col items-center justify-center flex-1 w-full max-w-md text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm">
            <div className="mb-8">
              <Image
                className="mx-auto dark:invert"
                src="/next.svg"
                alt="Next.js logo"
                width={100}
                height={20}
                priority
              />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              Welcome to Learning Platform
            </h1>
            <p className="text-gray-600 mb-8 text-sm">
              Join our community to start your learning journey
            </p>
            <div className="flex flex-col gap-4">
              <a
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-300 text-center"
                href="/login"
              >
                Login
              </a>
              <a
                className="w-full py-3 px-4 bg-gray-800 hover:bg-gray-900 text-white font-medium rounded-lg transition duration-300 text-center"
                href="/register"
              >
                Register
              </a>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}