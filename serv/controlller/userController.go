package controlller

import (
	"stockpille/entity"
	"stockpille/service"
	"strconv"

	"github.com/gin-gonic/gin"
)

func NewUser(c *gin.Context) {
	var user entity.User
	c.BindJSON(&user)
	if !service.NewUser(user) {
		c.JSON(400, gin.H{
			"message": "User already exists",
		})
		return
	}
	c.JSON(200, gin.H{
		"status": "User created, lad",
	})
}

func Login(c *gin.Context) {
	var user entity.User
	c.BindJSON(&user)
	token := service.Login(user)
	if token != "error" {
		c.JSON(200, gin.H{
			"token": token,
		})
	} else {
		c.JSON(400, gin.H{
			"message": "Invalid user or password",
		})
	}
}

func GetAllUsers(c *gin.Context) {
	c.JSON(200, gin.H{
		"users": service.GetAllUsers(),
	})
}

func GetUserById(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))

	if err != nil {
		c.JSON(400, gin.H{
			"message": "Invalid id",
		})
		return
	}

	user := service.GetUserById(id)
	if user == nil {
		c.JSON(400, gin.H{
			"message": "User not found",
		})
		return
	}
	c.JSON(200, gin.H{
		"user": user,
	})
}

func DeleteUser(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))

	if err != nil {
		c.JSON(400, gin.H{
			"message": "Invalid id",
		})
		return
	}

	service.DeleteUser(id)
	c.JSON(200, gin.H{
		"status": "User deleted, lad",
	})
}

func UpdateUser(c *gin.Context) {
	var user entity.User
	c.BindJSON(&user)
	id, err := strconv.Atoi(c.Param("id"))

	if err != nil {
		c.JSON(400, gin.H{
			"message": "Invalid id",
		})
		return
	}
	user.Id = id
	service.UpdateUser(user)
	c.JSON(200, gin.H{
		"status": "User updated, lad",
	})
}
