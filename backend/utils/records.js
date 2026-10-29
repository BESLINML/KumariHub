const camelize = (row) => {
  if (!row) return row;
  const { id, ...fields } = row;
  const value = { _id: String(id), ...fields };
  if ('avgRating' in value) value.avgRating = Number(value.avgRating);
  if ('rating' in value) value.rating = Number(value.rating);
  return value;
};

const normalizePhone = (number) => {
  const digits = String(number || '').replace(/\D/g, '');
  return digits.length === 10 ? `91${digits}` : digits;
};

module.exports = { camelize, normalizePhone };
