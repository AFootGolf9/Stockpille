package controlller

import (
	"stockpille/entity"
	"stockpille/service"
	"strconv"

	"github.com/gin-gonic/gin"
)

func NewItem(c *gin.Context) {
	var item entity.Item
	c.BindJSON(&item)
	service.NewItem(item)
	c.JSON(200, gin.H{
		"status": "Item created, lad",
	})
}

func GetItemById(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))

	if err != nil {
		c.JSON(400, gin.H{
			"error": "Invalid ID",
		})
	}

	item := service.GetItemById(id)
	c.JSON(200, gin.H{
		"item": item,
	})
}

func GetAllItems(c *gin.Context) {
	c.JSON(200, gin.H{
		"items": service.GetAllItems(),
	})
}
