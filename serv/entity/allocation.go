package entity

type Allocation struct {
	Id         int `json:"id"`
	ItemId     int `json:"item_id"`
	LocationId int `json:"location_id"`
	UserId     int `json:"user_id"`
}

// select item_sku, location_id, user_id, count(item_sku) from allocation group by item_sku, location_id, user_id;
// maybe imple

func (a *Allocation) GetId() int {
	return a.Id
}

func (a *Allocation) SetId(id int) {
	a.Id = id
}

func (a *Allocation) GetCamps() []string {
	return []string{"allocation", "id", "item_sku", "location_id", "user_id"}
}

func (a *Allocation) GetData() []any {
	return []any{&a.Id, &a.ItemId, &a.LocationId, &a.UserId}
}

func (a *Allocation) GetPath() string {
	return "allocation"
}

func (a *Allocation) IsPersisted() bool {
	return true
}

func (a *Allocation) Validate(id int) {
	if a.ItemId == 0 {
		panic("Item is required")
	}
	if a.LocationId == 0 {
		panic("Location is required")
	}

	a.UserId = id
}

func (a *Allocation) ValidateUpdate() {
}

func (a *Allocation) HideSecret() {
}

func (a *Allocation) New() Entity {
	return &Allocation{}
}
