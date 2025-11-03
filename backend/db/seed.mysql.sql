-- MySQL Seed Data for Parapharmacie Store

-- Insert default users
-- Passwords are hashed with bcrypt (password: admin123, user123, delivery123)
INSERT INTO users (email, password, name, role) VALUES
('admin@example.com', '$2a$10$rXKH3z5H5H5H5H5H5H5H5uK5H5H5H5H5H5H5H5H5H5H5H5H5H5H5H5', 'Admin User', 'ADMIN'),
('user@example.com', '$2a$10$rXKH3z5H5H5H5H5H5H5H5uK5H5H5H5H5H5H5H5H5H5H5H5H5H5H5H5', 'John Doe', 'USER'),
('delivery@example.com', '$2a$10$rXKH3z5H5H5H5H5H5H5H5uK5H5H5H5H5H5H5H5H5H5H5H5H5H5H5H5', 'Delivery Person', 'DELIVERY');

-- Insert sample products
INSERT INTO products (name, description, price, image, category, stock, ingredients, specs, rating, reviews_count) VALUES
('Bioderma Sensibio H2O', 'Micellar water for sensitive skin. Gently cleanses and removes makeup.', 89.00, 'https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?w=400', 'Skincare', 50, 'Aqua, PEG-6 Caprylic/Capric Glycerides, Cucumis Sativus', 'Size: 500ml | For all skin types | Fragrance-free', 4.8, 156),
('La Roche-Posay Anthelios', 'Very high sun protection SPF 50+ for face and body.', 165.00, 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400', 'Skincare', 35, 'Avobenzone, Homosalate, Octisalate, Octocrylene', 'SPF 50+ | Water resistant | Non-greasy', 4.9, 203),
('Vichy Mineral 89', 'Daily skin booster with hyaluronic acid. Fortifies skin barrier.', 210.00, 'https://images.unsplash.com/photo-1571875257727-256c39da42af?w=400', 'Skincare', 28, 'Vichy Mineralizing Water, Hyaluronic Acid', '50ml | Hypoallergenic | Dermatologist tested', 4.7, 189),
('Avène Thermal Water', 'Soothing thermal spring water spray for sensitive skin.', 75.00, 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400', 'Skincare', 60, 'Avène Thermal Spring Water', '300ml | Anti-irritating | Calming', 4.6, 142),
('Nuxe Huile Prodigieuse', 'Multi-purpose dry oil for face, body and hair.', 185.00, 'https://images.unsplash.com/photo-1571875257727-256c39da42af?w=400', 'Beauty', 22, 'Macadamia Oil, Hazelnut Oil, Sweet Almond Oil, Camellia Oil', '100ml | Nourishing | Signature scent', 4.8, 267),
('Mustela Hydra Bébé', 'Body lotion for baby\'s delicate skin. Moisturizes and protects.', 95.00, 'https://images.unsplash.com/photo-1584670592170-e081712f7e28?w=400', 'Baby Care', 40, 'Avocado Perseose, Jojoba Oil, Glycerin', '300ml | Hypoallergenic | 0% parabens', 4.9, 178),
('Caudalie Vinoperfect Serum', 'Radiance serum with Viniferine to reduce dark spots.', 395.00, 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400', 'Skincare', 15, 'Viniferine, Olive Squalane, Glycerin', '30ml | Brightening | Natural origin', 4.7, 198),
('Eucerin AtopiControl', 'Soothing cream for atopic skin. Reduces itching and irritation.', 165.00, 'https://images.unsplash.com/photo-1556228852-80c63c043e5d?w=400', 'Skincare', 32, 'Omega-6 Fatty Acids, Licochalcone A, Ceramides', '200ml | Fragrance-free | Clinically proven', 4.6, 134),
('Weleda Skin Food', 'Ultra-rich cream for dry to very dry skin. Natural ingredients.', 125.00, 'https://images.unsplash.com/photo-1556228852-80c63c043e5d?w=400', 'Skincare', 45, 'Sunflower Oil, Pansy Extract, Rosemary Extract, Chamomile', '75ml | Natural | Multi-use', 4.8, 223),
('Klorane Shampoo', 'Gentle shampoo with oat milk for frequent use.', 85.00, 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=400', 'Hair Care', 55, 'Oat Milk, Mild Surfactants', '400ml | pH balanced | Biodegradable formula', 4.5, 167),
('Ducray Anaphase+', 'Anti-hair loss shampoo. Strengthens and revitalizes hair.', 145.00, 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=400', 'Hair Care', 25, 'Monolaurin, Tocopherol Nicotinate, Vitamins B5, B6, B8', '400ml | Paraben-free | Dermatologically tested', 4.4, 145),
('Phyto Phytophanère', 'Hair and nails dietary supplement. Strengthens from within.', 285.00, 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400', 'Supplements', 30, 'Vitamins B6, B8, E, Zinc, Essential Fatty Acids', '120 capsules | 4-month program | Natural', 4.6, 189);

-- Note: Update user passwords with proper bcrypt hashes before production!
-- Use the following Node.js code to generate proper hashes:
-- const bcrypt = require('bcryptjs');
-- const hash = await bcrypt.hash('your-password', 10);
