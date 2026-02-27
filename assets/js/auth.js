// ================================================================
// NECHIS — Auth & Session Management
// ================================================================

const AUTH_KEY = 'nechis_session';

const Auth = {
    // ---- Session ----
    login(user) {
        const session = {
            id: user.id,
            name: user.name,
            initials: user.initials,
            role: user.role,
            facility: user.facility,
            facilityId: user.facilityId,
            region: user.region,
            unit: user.unit,
            email: user.email,
            loginTime: Date.now(),
        };
        localStorage.setItem(AUTH_KEY, JSON.stringify(session));
        return session;
    },

    logout() {
        localStorage.removeItem(AUTH_KEY);
        window.location.hash = '';
        renderLogin();
    },

    getUser() {
        try {
            return JSON.parse(localStorage.getItem(AUTH_KEY));
        } catch { return null; }
    },

    isLoggedIn() {
        const u = this.getUser();
        return !!u;
    },

    // ---- Data Scope helpers ----
    // Returns filtered facilities visible to the current user
    getFacilities() {
        const u = this.getUser();
        if (!u) return [];
        const all = NDATA.facilities;
        if (u.role === 'national_command' || u.role === 'analytics_officer') return all;
        if (u.role === 'regional_director') return all.filter(f => f.region === u.region);
        if (u.facilityId) return all.filter(f => f.id === u.facilityId);
        if (u.region) return all.filter(f => f.region === u.region);
        if (u.role === 'public') return all;
        return all;
    },

    getReferrals() {
        const u = this.getUser();
        if (!u) return [];
        const all = NDATA.referrals;
        if (u.role === 'national_command' || u.role === 'analytics_officer' || u.role === 'regional_director') return all;
        if (u.facilityId) return all.filter(r => r.fromFacilityId === u.facilityId || r.toFacilityId === u.facilityId);
        if (u.region) return all.filter(r => r.region === u.region);
        return all;
    },

    getAmbulances() {
        const u = this.getUser();
        if (!u) return [];
        const all = NDATA.ambulances;
        if (u.role === 'national_command') return all;
        if (u.region) return all.filter(a => a.region === u.region);
        return all;
    },

    getEquipment() {
        const u = this.getUser();
        if (!u) return [];
        const all = NDATA.equipment;
        if (u.role === 'national_command' || u.role === 'analytics_officer') return all;
        if (u.role === 'regional_director') return all.filter(e => e.region === u.region);
        if (u.facilityId) return all.filter(e => e.facilityId === u.facilityId);
        if (u.region) return all.filter(e => e.region === u.region);
        return all;
    },

    getBedUnits() {
        const u = this.getUser();
        if (!u) return [];
        const all = NDATA.bedUnits;
        if (u.role === 'national_command' || u.role === 'analytics_officer') return all;
        if (u.role === 'regional_director') return all.filter(b => b.region === u.region);
        if (u.facilityId && u.unit) return all.filter(b => b.facilityId === u.facilityId && b.unit === u.unit);
        if (u.facilityId) return all.filter(b => b.facilityId === u.facilityId);
        if (u.region) return all.filter(b => b.region === u.region);
        return all;
    },

    // ---- Permissions ----
    can(action) {
        const u = this.getUser();
        if (!u) return false;
        const perms = {
            national_command: { createReferral: true, acceptReferral: true, dispatch: true, manageBeds: true, manageEquip: true, viewAnalytics: true, manageUsers: true, activateSurge: true },
            analytics_officer: { createReferral: false, acceptReferral: false, dispatch: false, manageBeds: false, manageEquip: false, viewAnalytics: true, manageUsers: false, activateSurge: false },
            regional_director: { createReferral: true, acceptReferral: true, dispatch: true, manageBeds: true, manageEquip: true, viewAnalytics: true, manageUsers: false, activateSurge: true },
            hecu_commander: { createReferral: true, acceptReferral: true, dispatch: false, manageBeds: true, manageEquip: true, viewAnalytics: false, manageUsers: false, activateSurge: true },
            bed_manager: { createReferral: false, acceptReferral: true, dispatch: false, manageBeds: true, manageEquip: false, viewAnalytics: false, manageUsers: false, activateSurge: false },
            nurse: { createReferral: true, acceptReferral: false, dispatch: false, manageBeds: false, manageEquip: false, viewAnalytics: false, manageUsers: false, activateSurge: false },
            emt_dispatcher: { createReferral: true, acceptReferral: false, dispatch: true, manageBeds: false, manageEquip: false, viewAnalytics: false, manageUsers: false, activateSurge: false },
            clinician: { createReferral: true, acceptReferral: false, dispatch: false, manageBeds: false, manageEquip: false, viewAnalytics: false, manageUsers: false, activateSurge: false },
            equipment_officer: { createReferral: false, acceptReferral: false, dispatch: false, manageBeds: false, manageEquip: true, viewAnalytics: false, manageUsers: false, activateSurge: false },
            public: { createReferral: false, acceptReferral: false, dispatch: false, manageBeds: false, manageEquip: false, viewAnalytics: false, manageUsers: false, activateSurge: false },
        };
        return !!(perms[u.role] && perms[u.role][action]);
    },

    getScopeLabel() {
        const u = this.getUser();
        if (!u) return '';
        if (u.unit && u.facility) return `${u.unit} — ${u.facility}`;
        if (u.facility) return u.facility;
        if (u.region) return `${u.region} Region`;
        return 'National';
    },
};
