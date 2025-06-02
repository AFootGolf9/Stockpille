package controller

import (
	"stockpille/repository"
	"strconv"

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
	out := repository.RelAllocByUser()
	c.JSON(200, out)
}

func RelAllocByItem(c *gin.Context) {
	out := repository.RelAllocByItem()
	c.JSON(200, out)
}

func RelItemByLocation(c *gin.Context) {
	out := repository.RelItemByLocation()
	c.JSON(200, out)
}

func RelItemByCategory(c *gin.Context) {
	out := repository.RelItemByCategory()
	c.JSON(200, out)
}

func RelUserByRole(c *gin.Context) {
	out := repository.RelUserByRole()
	c.JSON(200, out)
}
