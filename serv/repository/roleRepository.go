package repository

func CreateRolePermission(roleId int, table string, permission string) {
	if permission == "" {
		permission = "rwdu"
	}

	_, err := db.Exec("INSERT INTO role_permission (role_id, table_name, permission) VALUES ($1, $2, $3)", roleId, table, permission)
	if err != nil {
		panic(err)
	}
}

func GetRolePermission(roleId int) map[string]string {
	rows, err := db.Query("SELECT table_name, permission FROM role_permission WHERE role_id = $1", roleId)
	if err != nil {
		panic(err)
	}
	defer rows.Close()
	out := make(map[string]string)
	for rows.Next() {
		var table, permission string
		rows.Scan(&table, &permission)
		out[table] = permission
	}
	return out
}

func GetRolePermissionByTable(roleId int, table string) string {
	rows, err := db.Query("SELECT permission FROM role_permission WHERE role_id = $1 AND table_name = $2", roleId, table)
	if err != nil {
		panic(err)
	}
	defer rows.Close()
	var permission string
	if rows.Next() {
		rows.Scan(&permission)
	}
	return permission
}

func UpdateRolePermission(roleId int, table string, permission string) {
	if permission == "" {
		permission = "rwdu"
	}

	_, err := db.Exec("UPDATE role_permission SET permission = $1 WHERE role_id = $2 AND table_name = $3", permission, roleId, table)
	if err != nil {
		panic(err)
	}
}

func VerifyRole(roleId int) bool {
	rows, err := db.Query("SELECT id FROM role WHERE id = $1", roleId)
	if err != nil {
		panic(err)
	}
	defer rows.Close()
	return rows.Next()
}
