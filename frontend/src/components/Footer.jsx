export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-6 poppins">
      <div className="max-w-6xl mx-auto px-6">
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Logo / Title */}
          <h2 className="text-lg font-semibold">Marksheet</h2>

          {/* Links */}
          <ul className="flex gap-6 text-sm">
            <li className="hover:text-white cursor-pointer">Privacy</li>
            <li className="hover:text-white cursor-pointer">Terms</li>
            <li className="hover:text-white cursor-pointer">Contact</li>
          </ul>

        </div>

        {/* Bottom Text */}
        <p className="text-center text-xs text-gray-500 mt-4">
          © {new Date().getFullYear()} MySite. All rights reserved.
        </p>

      </div>
    </footer>
  );
}
