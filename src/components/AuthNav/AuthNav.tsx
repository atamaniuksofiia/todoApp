import { Link } from "react-router-dom";

function AuthNav() {
  return (
    <nav className="flex items-center justify-between p-4 bg-gray-100 border-b border-gray-300">
      <div className="flex gap-6">
        <Link
          to="/dashboard"
          className=" font-medium text-gray-800 hover:text-purple-600 transition-colors duration-200"
        >
          Dashboard
        </Link>
      </div>

      <div className="flex gap-4 border-l border-gray-300 pl-4">
        <Link
          to="/login"
          className=" font-medium text-gray-800 hover:text-purple-600 transition-colors duration-200"
        >
          Вхід
        </Link>
        <Link
          to="/register"
          className=" font-medium text-gray-800 hover:text-purple-600 transition-colors duration-200"
        >
          Реєстрація
        </Link>
      </div>
    </nav>
  );
}

export default AuthNav;
