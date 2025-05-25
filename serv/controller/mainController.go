package controller

import (
	"stockpille/entity"
	"stockpille/service"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

func MakeController(object entity.Entity, rest Rest) func(c *gin.Context) {
	return func(c *gin.Context) {
		switch rest {
		case GET:
			getController(object, c)
		case GETALL:
			getControllerWithPagination(object, c)
		case POST:
			postController(object, c)
		case PUT:
			putController(object, c)
		case DELETE:
			deleteController(object, c)
		}
	}
}

func getController(object entity.Entity, c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	user := c.MustGet("user").(entity.User)

	if err != nil {
		c.JSON(400, gin.H{
			"error": "Invalid ID",
		})
	}

	permission, err := service.GetRolePermission(user.RoleId, object.GetCamps()[0])
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
	if strings.Contains(permission, "r") {
		allowed = "self"
	}
	if strings.Contains(permission, "R") {
		allowed = "all"
	}

	object.SetId(id)

	object, err = service.Get(object, allowed, user.Id)

	if err != nil {
		c.JSON(404, gin.H{
			"error": "Item not found",
		})
		return
	}
	c.JSON(200, gin.H{
		"data": object,
	})
}

func getAllController(object entity.Entity, c *gin.Context) {
	c.JSON(200, gin.H{
		"data": service.GetAll(object),
	})
}

func getControllerWithPagination(object entity.Entity, c *gin.Context) {
	pageStr := c.Query("page")
	sizeStr := c.Query("size")
	user := c.MustGet("user").(entity.User)
	page := 0
	size := 15

	if pageStr != "" {
		page, _ = strconv.Atoi(pageStr)
	}

	if sizeStr != "" {
		size, _ = strconv.Atoi(sizeStr)
	}

	permission, err := service.GetRolePermission(user.RoleId, object.GetCamps()[0])
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
	if strings.Contains(permission, "r") {
		allowed = "self"
	}
	if strings.Contains(permission, "R") {
		allowed = "all"
	}

	c.JSON(200, gin.H{
		"data": service.GetWithPagination(object, page, size, allowed, user.Id),
	})
}

func postController(object entity.Entity, c *gin.Context) {
	c.BindJSON(&object)

	user := c.MustGet("user").(entity.User)

	permission, err := service.GetRolePermission(user.RoleId, object.GetCamps()[0])
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

	if !strings.Contains(permission, "w") && !strings.Contains(permission, "W") {
		c.JSON(403, gin.H{
			"error": "Forbidden",
		})
		return
	}

	service.New(object, user.Id)
	c.JSON(200, gin.H{
		"status": "Entry created, lad",
	})
}

func putController(object entity.Entity, c *gin.Context) {
	c.BindJSON(&object)
	user := c.MustGet("user").(entity.User)

	id, err := strconv.Atoi(c.Param("id"))

	if err != nil {
		println(err.Error())
		c.JSON(400, gin.H{
			"error": "Invalid ID",
		})
	}

	permission, err := service.GetRolePermission(user.RoleId, object.GetCamps()[0])
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

	object.SetId(id)

	service.Update(object, allowed, user.Id)
	c.JSON(200, gin.H{
		"status": "Entry updated, lad",
	})
}

func deleteController(object entity.Entity, c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	user := c.MustGet("user").(entity.User)

	if err != nil {
		c.JSON(400, gin.H{
			"error": "Invalid ID",
		})
	}

	permission, err := service.GetRolePermission(user.RoleId, object.GetCamps()[0])
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
	if strings.Contains(permission, "d") {
		allowed = "self"
	}
	if strings.Contains(permission, "D") {
		allowed = "all"
	}

	object.SetId(id)

	service.Delete(object, allowed, user.Id)
	c.JSON(200, gin.H{
		"status": "Entry deleted, lad",
	})
}
