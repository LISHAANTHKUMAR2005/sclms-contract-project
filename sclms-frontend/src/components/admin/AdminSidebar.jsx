import { NavLink } from "react-router-dom";
import "../../styles/admin.css";

function AdminSidebar({ collapsed }) {
  return (
    <aside className={`admin-sidebar ${collapsed ? "collapsed" : ""}`}>
      <h2 className="sidebar-logo">
        {collapsed ? "S" : "SCLMS"}
      </h2>

      <nav className="sidebar-menu">
        <NavLink to="/admin/dashboard" className="sidebar-link">
          📊 {!collapsed && "Dashboard"}
        </NavLink>

        <NavLink to="/admin/approvals" className="sidebar-link">
          ✅ {!collapsed && "Approval Requests"}
        </NavLink>
      </nav>
    </aside>
  );
}

export default AdminSidebar;
