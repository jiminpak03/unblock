package learn.unblock.models;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;
import java.util.Objects;



public class Card {
    private int id;
    private int columnId;
    private Integer categoryId;
    private String title;
    private String description;
    private boolean isComplete;
    private int position;
    private String imageUrl;
    private LocalDateTime createdDate;
    private LocalDateTime editDate;

    public Card() {}

    public Card(int id, int columnId, Integer categoryId, String title, String description,
                boolean isComplete, int position, String imageUrl, LocalDateTime createdDate, LocalDateTime editDate) {
        this.id = id;
        this.columnId = columnId;
        this.categoryId = categoryId;
        this.title = title;
        this.description = description;
        this.isComplete = isComplete;
        this.position = position;
        this.imageUrl = imageUrl;
        this.createdDate = createdDate;
        this.editDate = editDate;
    }

    @JsonProperty("isComplete")
    public boolean isComplete() {
        return isComplete;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getColumnId() {
        return columnId;
    }

    public void setColumnId(int columnId) {
        this.columnId = columnId;
    }

    public Integer getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Integer categoryId) {
        this.categoryId = categoryId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setComplete(boolean complete) {
        isComplete = complete;
    }

    public int getPosition() {
        return position;
    }

    public void setPosition(int position) {
        this.position = position;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public LocalDateTime getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(LocalDateTime createdDate) {
        this.createdDate = createdDate;
    }

    public LocalDateTime getEditDate() {
        return editDate;
    }

    public void setEditDate(LocalDateTime editDate) {
        this.editDate = editDate;
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        Card card = (Card) o;
        return id == card.id && columnId == card.columnId && isComplete == card.isComplete
                && position == card.position && Objects.equals(categoryId, card.categoryId)
                && Objects.equals(title, card.title) && Objects.equals(description, card.description)
                && Objects.equals(imageUrl, card.imageUrl) && Objects.equals(createdDate, card.createdDate)
                && Objects.equals(editDate, card.editDate);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, columnId, categoryId, title, description, isComplete, position, imageUrl, createdDate, editDate);
    }
}