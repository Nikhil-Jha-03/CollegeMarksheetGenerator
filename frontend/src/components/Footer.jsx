import CollegeLogo from "../assets/CollegeLogo.png";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 text-gray-700 py-6 poppins">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Logo / Title */}
          <div className="flex items-center gap-3">
            <img 
              src={CollegeLogo} 
              alt="College Logo" 
              className="w-8 h-8 object-contain"
            />
            <h2 className="text-lg font-semibold text-gray-900">Marksheet</h2>
          </div>

          {/* Links */}
          <ul className="flex gap-6 text-sm">
            <li className="hover:text-blue-600 cursor-pointer transition-colors">Privacy</li>
            <li className="hover:text-blue-600 cursor-pointer transition-colors">Terms</li>
            <li className="hover:text-blue-600 cursor-pointer transition-colors">Contact</li>
          </ul>

        </div>

        {/* Bottom Text */}
        <p className="text-center text-xs text-gray-500 mt-4">
          © {new Date().getFullYear()} Marksheet. All rights reserved. Made by Nikhil Jha.
        </p>
      

      </div>
    </footer>
  );
}