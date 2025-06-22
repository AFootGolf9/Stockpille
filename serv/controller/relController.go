package controller

import (
	"stockpille/entity"
	"stockpille/repository"
	"stockpille/service"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

func GetItemQuantity(c *gin.Context) {
	num, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		print(err.Error())
		c.JSON(400, gin.H{
			"error": "Invalid ID",
		})
		return
	}
	out := repository.GetItemQuantity(num)
	c.JSON(200, gin.H{
		"quantity": out,
	})
}

func RelAllocByUser(c *gin.Context) {
	user := c.MustGet("user").(entity.User)

	permission, err := service.GetRolePermission(user.RoleId, "relatorio1")
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

	if !strings.Contains(permission, "R") {
		c.JSON(403, gin.H{
			"error": "Forbidden",
		})
		return
	}

	out := repository.RelAllocByUser()
	c.JSON(200, out)
}

func RelAllocByItem(c *gin.Context) {
	user := c.MustGet("user").(entity.User)

	permission, err := service.GetRolePermission(user.RoleId, "relatorio2")
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

	if !strings.Contains(permission, "R") {
		c.JSON(403, gin.H{
			"error": "Forbidden",
		})
		return
	}

	out := repository.RelAllocByItem()
	c.JSON(200, out)
}

func RelItemByLocation(c *gin.Context) {
	user := c.MustGet("user").(entity.User)

	permission, err := service.GetRolePermission(user.RoleId, "relatorio3")
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

	if !strings.Contains(permission, "R") {
		c.JSON(403, gin.H{
			"error": "Forbidden",
		})
		return
	}

	out := repository.RelItemByLocation()
	c.JSON(200, out)
}

func RelItemByCategory(c *gin.Context) {
	user := c.MustGet("user").(entity.User)

	permission, err := service.GetRolePermission(user.RoleId, "relatorio4")
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

	if !strings.Contains(permission, "R") {
		c.JSON(403, gin.H{
			"error": "Forbidden",
		})
		return
	}

	out := repository.RelItemByCategory()
	c.JSON(200, out)
}

func RelUserByRole(c *gin.Context) {
	user := c.MustGet("user").(entity.User)

	permission, err := service.GetRolePermission(user.RoleId, "relatorio5")
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

	if !strings.Contains(permission, "R") {
		c.JSON(403, gin.H{
			"error": "Forbidden",
		})
		return
	}

	out := repository.RelUserByRole()
	c.JSON(200, out)
}
