package controller

import (
	"stockpille/entity"
	"stockpille/service"

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
		Id:   roleWithPermission.Id,
		Name: roleWithPermission.Name,
	}

	service.New(&role)

	for _, permission := range roleWithPermission.Permissions {
		p := entity.Permission{
			RoleId:     roleWithPermission.Id,
			Permission: permission.Permission,
			Table:      permission.Table,
		}
		service.New(&p)
	}
	c.JSON(200, gin.H{"status": "success"})
}
