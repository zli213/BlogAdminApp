package ictgradschool.BlogAdminApp.swingclient.ui;

import ictgradschool.BlogAdminApp.swingclient.pojos.LoginResponse;
import ictgradschool.BlogAdminApp.swingclient.pojos.User;
import ictgradschool.BlogAdminApp.swingclient.web.API;

import javax.swing.*;
import javax.swing.JOptionPane;
import javax.swing.table.DefaultTableModel;
import javax.swing.table.TableColumn;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.io.IOException;
import java.util.List;
import java.util.concurrent.ExecutionException;

public class BlogAdminApp extends javax.swing.JFrame {

    private JButton loginButton;
    private JButton logoutButton;
    private JButton deleteUserButton;
    private JButton refreshButton;
    private JLabel userName;
    private JLabel password;
    private JTextField usernameField;
    private JPasswordField passwordField;
    private JTable userTable;

    public BlogAdminApp() {

        initComponents();
        // Initially disable logout and delete user buttons
        logoutButton.setEnabled(false);
        deleteUserButton.setEnabled(false);
        refreshButton.setEnabled(false);
        loginButton.addActionListener(this::handleBtnLoginClick);
        logoutButton.addActionListener(this::handleBtnLogoutClick);
        deleteUserButton.addActionListener(this::handleBtnDeleteClick);
        refreshButton.addActionListener(this::handleBtnRefreshClick);

        setLocationRelativeTo(null);
        setVisible(true);
        setResizable(true);
        setSize(1200, 600);
    }

    private void initComponents() {

        initLabelsAndFields();

        initButtons();

        JScrollPane jScrollPane1 = initUserTable();

        setDefaultCloseOperation(javax.swing.WindowConstants.EXIT_ON_CLOSE);
        setTitle("Blog Admin");
        setResizable(false);

        createPanelWithComponents(jScrollPane1);
    }
    private void initLabelsAndFields() {
        userName = new JLabel("Username:");
        password = new JLabel("Password:");

        usernameField = new JTextField(10);
        usernameField.setMaximumSize(new Dimension(150, 30)); // Set the maximum size of the text field
        passwordField = new JPasswordField(10);
        passwordField.setMaximumSize(new Dimension(150, 30)); // Set the maximum size of the password field
    }
    private void initButtons() {
        loginButton = new JButton("Login");
        logoutButton = new JButton("Logout");
        deleteUserButton = new JButton("Delete User");
        refreshButton = new JButton("Refresh");
    }
    private JScrollPane initUserTable() {
        userTable = new JTable(new DefaultTableModel(new Object[]{"Username", "First Name", "Last Name", "Password", "Admin Status", "Aticle Count"}, 0));
        TableColumn secondColumn = userTable.getColumnModel().getColumn(3);
        secondColumn.setPreferredWidth(400);
        return new JScrollPane(userTable);
    }
    private void createPanelWithComponents(JScrollPane jScrollPane1) {
        // Create a JPanel for the first row
        JPanel panel1 = new JPanel();
        panel1.setLayout(new BoxLayout(panel1, BoxLayout.X_AXIS));
        panel1.add(Box.createHorizontalGlue()); // Add glue to the start
        panel1.add(userName);
        panel1.add(usernameField);
        panel1.add(password);
        panel1.add(passwordField);
        panel1.add(Box.createHorizontalGlue()); // Add glue to the end

        // Create a JPanel for the second row
        JPanel panel2 = new JPanel();
        panel2.setLayout(new BoxLayout(panel2, BoxLayout.X_AXIS));
        panel2.add(Box.createHorizontalGlue()); // Add glue to the start
        panel2.add(loginButton);
        panel2.add(logoutButton);
        panel2.add(Box.createHorizontalGlue()); // Add glue to the end

        // Create a JPanel for the JScrollPane and the second row
        JPanel panelCenter = new JPanel();
        panelCenter.setLayout(new BorderLayout());
        panelCenter.add(panel2, BorderLayout.NORTH);
        panelCenter.add(jScrollPane1, BorderLayout.CENTER);

        // Create a JPanel for the fourth row
        JPanel panel4 = new JPanel();
        panel4.setLayout(new BoxLayout(panel4, BoxLayout.X_AXIS));
        panel4.add(Box.createHorizontalGlue()); // Add glue to the start
        panel4.add(deleteUserButton);
        panel4.add(refreshButton);
        panel4.add(Box.createHorizontalGlue()); // Add glue to the end

        // Add everything to the frame using a BorderLayout
        setLayout(new BorderLayout());
        add(panel1, BorderLayout.NORTH);
        add(panelCenter, BorderLayout.CENTER);
        add(panel4, BorderLayout.SOUTH);
    }

    private void handleBtnLoginClick(ActionEvent e) {
        User user = new User(usernameField.getText(), new String(passwordField.getPassword()));
        new LoginSwingWorker(user).execute();
    }

    private void handleBtnLogoutClick(ActionEvent e) {
        User user = new User(usernameField.getText(), new String(passwordField.getPassword()));
        new LogoutSwingWorker(user).execute();
    }

    private void handleBtnDeleteClick(ActionEvent e) {
        int selectedRow = userTable.getSelectedRow(); // get selected row
        if (selectedRow == -1) { // if no row is selected
            JOptionPane.showMessageDialog(BlogAdminApp.this, "No user selected", "Error", JOptionPane.ERROR_MESSAGE);
            return;
        }

        String username = (String) userTable.getValueAt(selectedRow, 0); // assuming the username is in the first column
        if ("admin".equals(username)) { // if the selected user is admin
            JOptionPane.showMessageDialog(BlogAdminApp.this, "Cannot delete admin user", "Error", JOptionPane.ERROR_MESSAGE);
            return;
        }

        // We use selectedRow as userId because you mentioned that the order in the JTable matches the userId in the database
        int userId = selectedRow + 1; // Assuming the ID in the database starts from 1

        new DeleteUserSwingWorker(userId).execute();
    }

    private void handleBtnRefreshClick(ActionEvent e) {
        getUsers();
        // After successful refresh, send a message to the user
        JOptionPane.showMessageDialog(BlogAdminApp.this, "Refresh successful", "Success", JOptionPane.INFORMATION_MESSAGE);
    }


    private class LoginSwingWorker extends SwingWorker<LoginResponse, Void> {
        private final User user;
        private String errorMessage = null;

        public LoginSwingWorker(User user) {
            this.user = user;
        }

        @Override
        protected LoginResponse doInBackground() throws Exception {
            try {
                return API.getInstance().login(user);
            } catch (IOException | InterruptedException ex) {
                ex.printStackTrace();
                errorMessage = ex.getMessage();
                return null;
            } catch (RuntimeException ex) {
                // Catch the RuntimeException separately
                ex.printStackTrace();
                errorMessage = ex.getMessage();
                return null;
            }
        }

        @Override
        protected void done() {
            try {
                LoginResponse loginResponse = get();
                if (loginResponse == null || !loginResponse.isSuccess()) {
                    if (errorMessage != null && errorMessage.contains("status code: 401")) {
                        JOptionPane.showMessageDialog(BlogAdminApp.this, "Login failed: Invalid username or password provided.", "Error", JOptionPane.ERROR_MESSAGE);
                    } else {
                        JOptionPane.showMessageDialog(BlogAdminApp.this, "Login failed", "Error", JOptionPane.ERROR_MESSAGE);
                    }
                    return;
                }
                getUsers();

            } catch (InterruptedException | ExecutionException e) {
                e.printStackTrace();
            }
        }
    }

    private class LogoutSwingWorker extends SwingWorker<Boolean, Void> {
        private final User user;

        public LogoutSwingWorker(User user) {
            this.user = user;
        }

        @Override
        protected Boolean doInBackground() throws Exception {
            try {
                API.getInstance().logout();
                return true;
            } catch (IOException | InterruptedException ex) {
                ex.printStackTrace();
                return false;
            }
        }

        @Override
        protected void done() {
            try {
                boolean logoutSuccess = get();
                if (logoutSuccess) {
                    JOptionPane.showMessageDialog(BlogAdminApp.this, "Logout successful", "Success", JOptionPane.INFORMATION_MESSAGE);
                    // After successful logout, enable login button and disable logout and delete user buttons
                    loginButton.setEnabled(true);
                    logoutButton.setEnabled(false);
                    deleteUserButton.setEnabled(false);
                    refreshButton.setEnabled(false);
                    // clear the username and password fields
                    usernameField.setText("");
                    passwordField.setText("");

                    // delete table data
                    DefaultTableModel model = (DefaultTableModel) userTable.getModel();
                    model.setRowCount(0);
                } else {
                    JOptionPane.showMessageDialog(BlogAdminApp.this, "Logout failed", "Error", JOptionPane.ERROR_MESSAGE);
                }
            } catch (InterruptedException | ExecutionException e) {
                e.printStackTrace();
            }
        }
    }

    private class DeleteUserSwingWorker extends SwingWorker<Boolean, Void> {
        private final int userId;

        public DeleteUserSwingWorker(int userId) {
            this.userId = userId;
        }

        @Override
        protected Boolean doInBackground() throws Exception {
            try {
                return API.getInstance().deleteUser(userId);
            } catch (IOException | InterruptedException ex) {
                ex.printStackTrace();
                return false;
            }
        }

        @Override
        protected void done() {
            try {
                boolean isDeleted = get();
                if (isDeleted) {
                    JOptionPane.showMessageDialog(BlogAdminApp.this, "Delete successful", "Success", JOptionPane.INFORMATION_MESSAGE);
                    getUsers();  // Refresh the JTable data after successfully deleting a user
                } else {
                    JOptionPane.showMessageDialog(BlogAdminApp.this, "Delete failed", "Error", JOptionPane.ERROR_MESSAGE);
                }
            } catch (InterruptedException | ExecutionException e) {
                e.printStackTrace();
            }
        }
    }

    private void getUsers() {
        try {
            List<User> userList = API.getInstance().getAllUsers();
            if (userList.isEmpty()) {
                JOptionPane.showMessageDialog(BlogAdminApp.this, "You are not authorized as an admin", "Error", JOptionPane.ERROR_MESSAGE);
                logout();
                return;
            }
            // After successful login, disable login button and enable logout and delete user buttons
            loginButton.setEnabled(false);
            logoutButton.setEnabled(true);
            deleteUserButton.setEnabled(userTable.getRowCount() > 0);
            refreshButton.setEnabled(true);
            DefaultTableModel model = (DefaultTableModel) userTable.getModel();
            model.setRowCount(0);
            for (User user : userList) {
                model.addRow(new Object[]{user.getUsername(), user.getFname(), user.getLname(), user.getPassword(), user.isAdmin(), user.getArticle_count()});
            }
            // After updating the table, check if there's any data
            // if there's at least one row of data, enable delete user button
            deleteUserButton.setEnabled(userTable.getRowCount() > 0);
        } catch (IOException | InterruptedException e) {
            e.printStackTrace();
            JOptionPane.showMessageDialog(this, "Failed to get user list", "Error", JOptionPane.ERROR_MESSAGE);
        } catch (RuntimeException e) {
            // Handle the RuntimeException separately
            e.printStackTrace();
            JOptionPane.showMessageDialog(this, "Failed to get user list: " + e.getMessage(), "Error", JOptionPane.ERROR_MESSAGE);
        }
    }

    private void logout() {
        User user = new User(usernameField.getText(), new String(passwordField.getPassword()));
        new LogoutSwingWorker(user).execute();
    }
}