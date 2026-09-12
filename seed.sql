-- Sample data for local testing

INSERT INTO users (name, email, password_hash, phone) VALUES
('Asha Rao', 'asha@example.com', '$2b$10$replace_with_real_hash', '9876543210'),
('Rahul Mehta', 'rahul@example.com', '$2b$10$replace_with_real_hash', '9876500000');

INSERT INTO addresses (user_id, line1, city, state, zip_code, is_default) VALUES
(1, '12 MG Road', 'Bengaluru', 'Karnataka', '560001', TRUE),
(2, '45 Baner Road', 'Pune', 'Maharashtra', '411045', TRUE);

INSERT INTO meal_plans (name, description, price, meals_per_week, category) VALUES
('Veg Weekly Basic', 'Balanced vegetarian meals, 5 days a week', 1499.00, 5, 'veg'),
('Non-Veg Power Pack', 'High-protein non-veg meals, 6 days a week', 2199.00, 6, 'non-veg'),
('Keto Reset', 'Low-carb, high-fat keto meals', 2499.00, 5, 'keto');

INSERT INTO meals (name, description, calories, price, meal_type) VALUES
('Paneer Butter Masala Bowl', 'Paneer in a rich tomato gravy with rice', 620, 220.00, 'lunch'),
('Grilled Chicken & Veggies', 'Grilled chicken breast with sauteed vegetables', 540, 260.00, 'dinner'),
('Avocado Egg Toast', 'Whole grain toast with avocado and eggs', 380, 180.00, 'breakfast'),
('Keto Chicken Salad', 'Chicken, greens, olive oil dressing', 450, 240.00, 'lunch');

INSERT INTO plan_meals (plan_id, meal_id, day_of_week) VALUES
(1, 1, 'Monday'),
(1, 3, 'Wednesday'),
(2, 2, 'Tuesday'),
(3, 4, 'Thursday');

INSERT INTO subscriptions (user_id, plan_id, address_id, start_date, status) VALUES
(1, 1, 1, CURRENT_DATE, 'active'),
(2, 2, 2, CURRENT_DATE, 'active');

INSERT INTO deliveries (subscription_id, meal_id, delivery_date, status) VALUES
(1, 1, CURRENT_DATE, 'delivered'),
(1, 3, CURRENT_DATE + 2, 'scheduled'),
(2, 2, CURRENT_DATE, 'scheduled');

INSERT INTO payments (subscription_id, amount, method, status) VALUES
(1, 1499.00, 'upi', 'success'),
(2, 2199.00, 'card', 'success');

INSERT INTO reviews (user_id, meal_id, rating, comment) VALUES
(1, 1, 5, 'Loved the paneer bowl, very fresh.'),
(2, 2, 4, 'Great portion size, a bit salty.');
