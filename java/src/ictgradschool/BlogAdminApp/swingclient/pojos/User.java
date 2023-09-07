package ictgradschool.BlogAdminApp.swingclient.pojos;

public class User {

    private int id;
    private String username;
    private String password;
    private String fname;
    private String lname;
    private boolean Admin;
    private String birthdate;
    private String avatar_src;
    private String description;
    private String authToken;
    private Integer article_count;
    public User() {
    }

    public User(String username, String password) {
        this.username = username;
        this.password = password;
    }

    // Getter and setter for authToken
    public String getAuthToken() {
        return authToken;
    }

    public void setAuthToken(String authToken) {
        this.authToken = authToken;
    }

    public void setId(int id) {
        this.id = id;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public void setFname(String fname) {
        this.fname = fname;
    }

    public void setLname(String lname) {
        this.lname = lname;
    }

    public void setAdmin(boolean admin) {
        Admin = admin;
    }

    public int getId() {
        return this.id;
    }

    public String getUsername() {
        return this.username;
    }

    public String getPassword() {
        return this.password;
    }

    public String getFname() {
        return this.fname;
    }

    public String getLname() {
        return this.lname;
    }

    public boolean isAdmin() {
        return this.Admin;
    }

    public String getBirthdate() {
        return this.birthdate;
    }

    public void setBirthdate(String birthdate) {
        this.birthdate = birthdate;
    }
    public String getAvatar_src() {
        return avatar_src;
    }
    public void setAvatar_src(String avatar_src) {
        this.avatar_src = avatar_src;
    }
    public String getDescription() {
        return description;
    }
    public void setDescription(String description) {
        this.description = description;
    }
    public Integer getArticle_count() {
        return article_count;
    }
    public void setArticle_count(Integer article_count) {
        this.article_count = article_count;
    }
}
