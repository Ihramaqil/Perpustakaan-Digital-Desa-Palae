import React from 'react';

const Spinner = () => {
  return (
    <div className="flex items-center justify-center py-10">
      <div className="w-12 h-12 border-4 border-[#E64946] border-t-transparent rounded-full animate-spin" />
    </div>
  );
};

export default Spinner;
