const Films = ({ films }) => {
  return (
    <>
      <ul className="list-none space-y-4 text-4xl font-bold mb-3">
        {films &&
          films.data.map((film) => {
            return (
              <li key={film.id}>
                <a href={`film/` + film.id}>{film.attributes.title}</a>
              </li>
            );
          })}
      </ul>
    </>
  );
};

export default Films;
