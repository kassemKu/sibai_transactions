import { usePage } from "@inertiajs/react";


const CasherDashboard = () => {
    const { roles } = usePage().props;
    console.log("rolesCasher",roles)
  return (
    <div>CasherDashboard</div>
  )
}

export default CasherDashboard