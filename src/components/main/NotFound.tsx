import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => (
  <div className="w-full h-full flex flex-col items-center justify-center gap-6 p-6 text-center">
    <img src="/logo_single.png" alt="Logo" className="w-24 h-24 object-contain" />
    <h1 className="text-3xl lg:text-4xl 2xl:text-5xl font-gotham-bold text-primary">
      404 – Page Not Found
    </h1>
    <p className=" max-w-md text-secondary">Sorry, the page you are looking for does not exist.</p>
    <Link
      to="/"
      className="btn-base btn-primary px-6 py-2 rounded-full shadow-md hover:shadow-lg transition-all"
    >
      Go to Home
    </Link>
  </div>
);

export default NotFound;
