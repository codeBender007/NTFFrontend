// Builds the URLs for the LMS hierarchy:
// Plant -> Department -> Sub-Department -> Line -> Machine
//
// Plant is optional: when no plant is in context (legacy pages opened from the
// sidebar "Department" item) the old plant-less URLs are generated so the
// existing routes keep working.

export const buildPaths = (plantId) => {
    const hasPlant =
        plantId !== undefined && plantId !== null && String(plantId) !== "";

    return {
        hasPlant,
        plants: "/lms/plant",
        departments: hasPlant
            ? `/lms/plant/${plantId}/department`
            : "/lms/department",
        subDepartments: (deptId) =>
            hasPlant
                ? `/lms/plant/${plantId}/department/${deptId}/subdepartment`
                : `/lms/subdepartment/${deptId}`,
        lines: (deptId, subDeptId) =>
            hasPlant
                ? `/lms/plant/${plantId}/department/${deptId}/subdepartment/${subDeptId}/line`
                : `/lms/line/${deptId}/${subDeptId}`,
        machines: (deptId, subDeptId, lineId) =>
            hasPlant
                ? `/lms/plant/${plantId}/department/${deptId}/subdepartment/${subDeptId}/line/${lineId}/machine`
                : `/lms/machine/${deptId}/${subDeptId}/${lineId}`,
    };
};

export default buildPaths;
