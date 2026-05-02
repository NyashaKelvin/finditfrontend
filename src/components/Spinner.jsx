const Spinner = ({ className = "" }) => <div className={`flex items-center justify-center py-16 ${className}`}>
    <div className="h-10 w-10 rounded-full border-4 border-muted border-t-primary animate-spin" />
  </div>;
export default Spinner;
