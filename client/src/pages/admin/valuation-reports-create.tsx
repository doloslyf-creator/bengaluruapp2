// Legacy create form - redirects to comprehensive version
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function ValuationReportsCreate() {
  const [, navigate] = useLocation();
  
  useEffect(() => {
    navigate("/admin-panel/valuation-reports/create-comprehensive");
  }, [navigate]);
  
  return null;
}