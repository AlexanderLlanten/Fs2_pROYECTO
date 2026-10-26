import CategoryCard from "../molecules/CategoryCard.jsx";

function CategoryGrid({ categories }) {
    return (
        <div className="row g-3">
            {categories.map(category => (
                <div className="col-12 col-sm-6 col-lg-3" key={category.name}>
                    <CategoryCard category={category} />
                </div>
            ))}
        </div>
    );
}

export default CategoryGrid;
