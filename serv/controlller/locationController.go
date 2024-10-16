package controlller

import (
	"stockpille/entity"
	"stockpille/service"

	"github.com/gin-gonic/gin"
)

func NewLocation(c *gin.Context) {
	var location entity.Location
	c.BindJSON(&location)
	service.NewLocation(location)
	c.JSON(200, gin.H{
		"status": "Location created, lad",
	})
}

func GetAllLocations(c *gin.Context) {
	c.JSON(200, gin.H{
		"locations": service.GetAllLocations(),
	})
}
