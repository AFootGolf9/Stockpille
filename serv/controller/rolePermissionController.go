package controller

import (
	"stockpille/entity"
	"stockpille/repository"
	"stockpille/service"
	"strings"

	"github.com/gin-gonic/gin"
)

type RoleWithPermission struct {
	Id          int                 `json:"id"`
	Name        string              `json:"name"`
	Permissions []entity.Permission `json:"permission"`
}

func CreatePermission(c *gin.Context) {
	var roleWithPermission RoleWithPermission
	if err := c.ShouldBindJSON(&roleWithPermission); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	role := entity.Role{
		Name: roleWithPermission.Name,
	}

	user := c.MustGet("user").(entity.User)

	permission, err := service.GetRolePermission(user.RoleId, role.GetCamps()[0])
	if err != nil {
		c.JSON(500, gin.H{
			"error": "Internal server error",
		})
		return
	}
	if permission == "" {
		c.JSON(403, gin.H{
			"error": "Forbidden",
		})
		return
	}

	if !strings.Contains(permission, "c") && !strings.Contains(permission, "C") {
		c.JSON(403, gin.H{
			"error": "Forbidden",
		})
		return
	}

	service.New(&role, user.Id)

	roleId, err := repository.GetRoleIdByName(role.Name)

	if err != nil {
		c.JSON(500, gin.H{
			"error": "Internal server error",
		})
		return
	}
	role.SetId(roleId)

	for _, permission := range roleWithPermission.Permissions {
		p := entity.Permission{
			RoleId:     roleId,
			Permission: permission.Permission,
			Table:      permission.Table,
		}
		repository.CreateRolePermission(p.RoleId, p.Table, p.Permission)
	}
	c.JSON(200, gin.H{"status": "success"})
}

func UpdatePermission(c *gin.Context) {
	var roleWithPermission RoleWithPermission
	user := c.MustGet("user").(entity.User)

	if err := c.ShouldBindJSON(&roleWithPermission); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	roleWithPermission.Name = strings.ToUpper(roleWithPermission.Name)

	role := entity.Role{
		Name: roleWithPermission.Name,
	}

	roleId, err := repository.GetRoleIdByName(role.Name)

	if err != nil {
		c.JSON(404, gin.H{
			"error": "Role not found",
		})
		return
	}
	role.SetId(roleId)

	permission, err := service.GetRolePermission(user.RoleId, role.GetCamps()[0])
	if err != nil {
		c.JSON(500, gin.H{
			"error": "Internal server error",
		})
		return
	}
	if permission == "" {
		c.JSON(403, gin.H{
			"error": "Forbidden",
		})
		return
	}

	allowed := ""
	if strings.Contains(permission, "u") {
		allowed = "self"
	}
	if strings.Contains(permission, "U") {
		allowed = "all"
	}

	service.Update(&role, allowed, user.Id)

	for _, permission := range roleWithPermission.Permissions {
		p := entity.Permission{
			RoleId:     roleWithPermission.Id,
			Permission: permission.Permission,
			Table:      permission.Table,
		}
		repository.UpdateRolePermission(p.RoleId, p.Table, p.Permission)
	}
	c.JSON(200, gin.H{"status": "success"})
}

func GetPermission(c *gin.Context) {
	var roleWithPermission RoleWithPermission
	// user := c.MustGet("user").(entity.User)

	if err := c.ShouldBindJSON(&roleWithPermission); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	roleWithPermission.Name = strings.ToUpper(roleWithPermission.Name)

	roleId, err := repository.GetRoleIdByName(roleWithPermission.Name)
	if err != nil || roleId == 0 {
		c.JSON(404, gin.H{
			"error": "Role not found",
		})
		return
	}
	roleWithPermission.Id = roleId

	permissions := repository.GetRolePermission(roleWithPermission.Id)
	if permissions == nil {
		c.JSON(404, gin.H{
			"error": "Role not found",
		})
		return
	}
	roleWithPermission.Permissions = make([]entity.Permission, 0)
	for table, permission := range permissions {
		roleWithPermission.Permissions = append(roleWithPermission.Permissions, entity.Permission{
			RoleId:     roleWithPermission.Id,
			Permission: permission,
			Table:      table,
		})
	}
	c.JSON(200, roleWithPermission)
}

func DeletePermission(c *gin.Context) {
	var roleWithPermission RoleWithPermission
	user := c.MustGet("user").(entity.User)

	if err := c.ShouldBindJSON(&roleWithPermission); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	roleWithPermission.Name = strings.ToUpper(roleWithPermission.Name)

	role := entity.Role{
		Name: roleWithPermission.Name,
	}

	roleId, err := repository.GetRoleIdByName(role.Name)

	if err != nil {
		c.JSON(404, gin.H{
			"error": "Role not found",
		})
		return
	}
	role.SetId(roleId)

	permission, err := service.GetRolePermission(user.RoleId, role.GetCamps()[0])
	if err != nil {
		c.JSON(500, gin.H{
			"error": "Internal server error",
		})
		return
	}
	if strings.Contains(permission, "D") {
		c.JSON(403, gin.H{
			"error": "Forbidden",
		})
		return
	}

	repository.RemoveAllRolePermission(roleId)

	c.JSON(200, gin.H{"status": "success"})
}
