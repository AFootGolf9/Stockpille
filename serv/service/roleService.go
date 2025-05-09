package service

import "stockpille/repository"

func GetRolePermission(roleId int, camp string) (string, error) {
	permission := repository.GetRolePermissionByTable(roleId, camp)
	// if err != nil {
	// 	return "", err
	// }
	return permission, nil
}
